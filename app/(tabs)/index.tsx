import { ScreenWrapper } from '@/components/ScreenWrapper';
import { RadarChart } from '@/components/ui/RadarChart';
import { RADAR_DATA } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

import { Category, Habit, Log } from '@/db/types';
import { authService } from '@/services';
import { CategoryService } from '@/services/CategoryService';
import { HabitService } from '@/services/HabitService';

const fullConfig = resolveConfig(tailwindConfig);
// @ts-ignore
const PRIMARY_COLOR = fullConfig.theme?.extend?.colors?.primary || '#39FF14';

const DashboardScreen = () => {
    // Data State
    const [habits, setHabits] = useState<Habit[]>([]);
    const [logs, setLogs] = useState<Log[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [radarData, setRadarData] = useState<any>(RADAR_DATA);

    // Local state for modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [logNote, setLogNote] = useState('');
    const [isDone, setIsDone] = useState(false);
    
    // Derived state for tasks
    const today = new Date().toISOString().split('T')[0];

    const fetchData = useCallback(async () => {
        try {
            // Get last 7 days range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 6);
            
            const [fetchedHabits, fetchedLogs, fetchedCategories, allLogs] = await Promise.all([
                HabitService.getAllHabits(),
                HabitService.getLogsByDate(today),
                CategoryService.getAllCategories(),
                HabitService.getAllLogs()
            ]);

            // Calculate Radar Data
            const scores: number[] = [];
            const labelsWithScores: string[] = [];
            const colors: string[] = [];

            fetchedCategories.forEach(userCat => {
                let score = 0;
                
                const catHabits = fetchedHabits.filter(h => h.category_id === userCat.id);

                if (catHabits.length > 0) {
                    // All-Time calculation
                    const catLogs = allLogs.filter(l => {
                        const habit = fetchedHabits.find(h => h.id === l.habit_id);
                        return habit?.category_id === userCat.id && l.value;
                    });
                    
                    // Calculate max possible logs (sum of days since creation for each habit)
                    let totalPossible = 0;
                    const now = new Date();
                    
                    catHabits.forEach(h => {
                         const created = new Date(h.created_at);
                         let startTime = created.getTime();
                         
                         // Find earliest log for this habit to account for historical data
                         // imported or synced before the habit's local creation date
                         const habitLogs = catLogs.filter(l => l.habit_id === h.id);
                         if (habitLogs.length > 0) {
                             const earliestLogTime = habitLogs.reduce((min, log) => {
                                 const logTime = new Date(log.date).getTime();
                                 return logTime < min ? logTime : min;
                             }, startTime);
                             startTime = Math.min(startTime, earliestLogTime); // Ensure we take the earlier of creation or first log
                         }

                         const diffTime = Math.abs(now.getTime() - startTime);
                         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                         totalPossible += Math.max(1, diffDays); // At least 1 day
                    });

                    if (totalPossible > 0) {
                        score = Math.round((catLogs.length / totalPossible) * 100);
                        score = Math.min(score, 100);
                    }
                }  
                
                scores.push(score);
                labelsWithScores.push(userCat.name);
                colors.push(userCat.color);
            });

            // If no categories, maybe default? 
            // For now, let's allow empty if user has no cats (though onboarding creates them).

            setRadarData({
                labels: labelsWithScores,
                data: scores,
                colors: colors
            });

            setHabits(fetchedHabits);
            setLogs(fetchedLogs);
            setCategories(fetchedCategories);

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    }, [today]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    
    // Helper to map DB data to UI format
    const tasks = habits.map(habit => {
        const category = categories.find(c => c.id === habit.category_id);
        const log = logs.find(l => l.habit_id === habit.id && !!l.value); // Handle boolean or integer storage
        
        return {
            id: habit.id,
            text: habit.title,
            categoryName: category?.name || 'General',
            color: category?.color || '#FFF',
            done: !!log,
            currentLog: log
        };
    });

    const activeTasks = tasks.filter(t => !t.done);
    const completedTasks = tasks.filter(t => t.done);
    const sortedTasks = [...activeTasks, ...completedTasks];

    const openLogModal = (task: any) => {
        setSelectedTask(task);
        setIsDone(task.done);
        setLogNote(task.currentLog?.text || '');
        setModalVisible(true);
    };

    const handleSaveLog = async () => {
        if (!selectedTask) return;

        try {
            const existingLog = selectedTask.currentLog;

            if (isDone) {
                if (existingLog) {
                    await HabitService.updateLog(existingLog.id, true, logNote.trim() || null);
                } else {
                    const userId = await authService.getUserId();
                    if (!userId) {
                        // Should strictly handle this, maybe redirect to login? 
                        // For now, simple alert or return.
                        console.error('No user ID found');
                        return;
                    }

                    await HabitService.createLog({
                        habit_id: selectedTask.id,
                        user_id: userId,
                        date: today,
                        value: true,
                        text: logNote.trim() || null
                    });
                }
            } else {
                if (existingLog) {
                    await HabitService.deleteLog(existingLog.id);
                }
            }
            
            setModalVisible(false);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to save log:', error);
        }
    };

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (!selectedTask) return;
        const currentIndex = sortedTasks.findIndex(t => t.id === selectedTask.id);
        if (currentIndex === -1) return;

        let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
        
        // Loop navigation or stop? User didn't specify, but "next habit to log" implies flow.
        // Let's stop at ends for now to avoid confusion.
        if (newIndex < 0) newIndex = sortedTasks.length - 1; // Cycle
        if (newIndex >= sortedTasks.length) newIndex = 0; // Cycle

        openLogModal(sortedTasks[newIndex]);
    };

    return (
        <ScreenWrapper bg="bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-2 pb-6">
                <Text className="text-primary text-lg font-bold tracking-tight font-jb-bold uppercase">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')}
                </Text>
                <TouchableOpacity onPress={() => router.push('/profile')} className="h-10 w-10 items-center justify-center border-2 border-primary">
                    <MaterialIcons name="person" size={24} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Radar Chart & Legend Section */}
                <View className="px-6 mb-8">
                    <View className="border-2 border-primary p-4">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-white text-base font-bold font-mono">Life Radar</Text>
                            <View className="bg-[#39FF14] px-2 py-1">
                                <Text className="text-black text-xs font-bold font-mono uppercase">All Time</Text>
                            </View>
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                            {/* Chart - Left */}
                            <View className="items-center justify-center -ml-6">
                                <RadarChart 
                                    data={radarData.data} 
                                    labels={[]} // Hide labels on chart
                                    size={240} // Increased size
                                    color={PRIMARY_COLOR}
                                />
                            </View>

                            {/* Legend - Right */}
                            <View className="flex-1 ml-2 gap-2">
                                {radarData.labels.map((label: string, index: number) => {
                                    const score = radarData.data[index] || 0;
                                    const categoryColor = radarData.colors?.[index] || PRIMARY_COLOR;
                                    
                                    return (
                                        <View key={index} className="flex-row items-center justify-between">
                                            <Text 
                                                className="font-mono text-[10px] flex-1 mr-2" 
                                                numberOfLines={1}
                                                style={{ color: categoryColor }}
                                            >
                                                {label}
                                            </Text>
                                            <Text 
                                                className="font-mono text-[10px] font-bold"
                                                style={{ color: categoryColor }}
                                            >
                                                {score}%
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Today's List */}
                <View>
                    <Text className="px-6 pb-3 pt-5 text-[22px] font-bold text-white font-mono tracking-tighter">Today</Text>
                    {habits.length === 0 ? (
                         <View className="px-6 py-8 items-center bg-[#222] mx-6">
                            <Text className="text-[#666] font-mono text-center mb-4">No habits yet.</Text>
                            <TouchableOpacity onPress={() => router.push('/habits/manage')} className="bg-[#333] px-4 py-2 border border-[#666]">
                                <Text className="text-white font-mono uppercase text-xs">Create First Habit</Text>
                            </TouchableOpacity>
                         </View>
                    ) : (
                    <View className="bg-[#222] gap-[1px]"> 
                        {sortedTasks.map((item) => (
                            <TouchableOpacity 
                                key={item.id} 
                                onPress={() => openLogModal(item)}
                                className="flex-row gap-16 items-center justify-between bg-black px-6 py-4"
                            >
                                <View className="flex-1 flex-row items-center gap-4">
                                    <View style={{ backgroundColor: item.color }} className="h-3 w-3 rounded-full flex-shrink-0" />
                                    <Text className="text-white text-base font-mono" numberOfLines={1}>
                                        {item.text}
                                    </Text>
                                </View>
                                
                                <View className={cn(
                                    "px-3 py-1 border items-center justify-center",
                                    item.done ? "border-primary bg-primary" : "border-[#333] bg-transparent"
                                )}>
                                    <Text className={cn(
                                        "text-xs font-bold font-jb-bold uppercase",
                                        item.done ? "text-black" : "text-[#666]"
                                    )}>
                                        {item.done ? "DONE" : "LOG"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity 
                    onPress={() => router.push('/habits/manage')}
                    className="h-14 w-14 items-center justify-center border-2 border-primary bg-black shadow-lg shadow-primary/20 active:bg-primary/20"
                >
                    <MaterialIcons name="add" size={36} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>

            {/* Log Modal */}
             <Modal
                isVisible={isModalVisible}
                onBackdropPress={() => setModalVisible(false)}
                backdropOpacity={0.9}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
                style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
            >
                <View className="bg-black w-[90%] border border-[#333] p-6 pb-8 relative">
                     {/* Close Button Top Right */}
                     <TouchableOpacity 
                         onPress={() => setModalVisible(false)}
                         className="absolute -top-3 -right-3 h-10 w-10 items-center justify-center border border-[#333] bg-black z-50"
                     >
                         <MaterialIcons name="close" size={20} color="#666" />
                     </TouchableOpacity>

                     <View className="items-center mb-6">
                        {/* Header Navigation */}
                        <View className="flex-row items-center justify-between w-full mb-2">
                             <TouchableOpacity onPress={() => handleNavigate('prev')} className="p-2">
                                 <MaterialIcons name="chevron-left" size={32} color="#666" />
                             </TouchableOpacity>
                             
                             <View className="items-center flex-1">
                                 <Text className="text-white text-2xl font-bold font-jb-bold text-center mb-1" numberOfLines={1}>
                                      {selectedTask?.text}
                                 </Text>
                                 <Text className="text-[#888] text-xs font-mono text-center uppercase tracking-widest">
                                      {selectedTask?.categoryName || 'General'}
                                 </Text>
                             </View>

                             <TouchableOpacity onPress={() => handleNavigate('next')} className="p-2">
                                 <MaterialIcons name="chevron-right" size={32} color="#666" />
                             </TouchableOpacity>
                        </View>
                     </View>

                     {/* Toggle */}
                     <View className="items-center mb-8">
                         <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => setIsDone(!isDone)}
                            className={`border w-32 h-12 flex-row p-1 mb-3 ${isDone ? 'border-[#39FF14]' : 'border-[#333]'}`}
                         >
                             <View className={cn("flex-1", !isDone && "bg-[#666]")} />
                             <View className={cn("flex-1", isDone && "bg-[#39FF14]")} />
                         </TouchableOpacity>
                         <Text className={`font-bold font-jb-bold tracking-widest text-lg ${isDone ? 'text-[#39FF14]' : 'text-[#666]'}`}>
                             {isDone ? 'DONE' : 'NOT DONE'}
                         </Text>
                     </View>

                     {/* Optional Note */}
                     <View className="mb-8 w-full">
                         <TextInput 
                            value={logNote}
                            onChangeText={setLogNote}
                            placeholder="Add a note..."
                            placeholderTextColor="#444"
                            className="text-white font-mono text-center text-base border-b border-[#333] pb-2"
                            multiline
                         />
                     </View>

                     {/* Save Button - Always Active */}
                     <TouchableOpacity 
                        onPress={handleSaveLog}
                        className="w-full h-14 items-center justify-center bg-[#39FF14] active:opacity-90"
                    >
                         <Text className="font-bold font-jb-bold uppercase tracking-widest text-lg text-black">
                             SAVE LOG
                         </Text>
                     </TouchableOpacity>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

export default DashboardScreen;
