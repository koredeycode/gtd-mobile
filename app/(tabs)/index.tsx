import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistRadarChart } from '@/components/ui/BrutalistRadarChart';
import { CATEGORIES, HABITS, LOGS, RADAR_DATA } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
// Safely access colors, falling back if not found.  
// In a real app, you might have strong typing for your theme.
// @ts-ignore
const PRIMARY_COLOR = fullConfig.theme?.extend?.colors?.primary || '#39FF14';

export default function DashboardScreen() {
    // Local state for modal
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [logNote, setLogNote] = useState('');
    const [isDone, setIsDone] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const todayTasks = useMemo(() => {
        // Refresh dependency
        const _ = refreshKey;
        const today = new Date().toISOString().split('T')[0];
        const activeHabits = HABITS.filter(h => !h.deleted_at);
        
        return activeHabits.map(habit => {
            const category = CATEGORIES.find(c => c.id === habit.category_id);
            const isDoneBackend = LOGS.some(l => l.habit_id === habit.id && l.date === today && l.value);
            
            // Allow local override if we just saved it (not persisted in mock backend perfectly for this view without refresh, but simple cache works)
            // Actually, we'll write to LOGS array directly so useMemo recalculating should be enough if we trigger re-render
            const isDone = isDoneBackend; // Simplified for now as we will update LOGS
            
            return {
                id: habit.id,
                text: habit.title,
                categoryName: category?.name,
                color: category?.color || '#FFF',
                done: isDone
            };
        });
    }, [refreshKey]); // Recompute when we save a log

    const activeTasks = todayTasks.filter(t => !t.done);
    const completedTasks = todayTasks.filter(t => t.done);
    const sortedTasks = [...activeTasks, ...completedTasks];

    const openLogModal = (task: any) => {
        setSelectedTask(task);
        setIsDone(task.done);
        setLogNote(''); // Reset note or fetch existing if we were supporting editing today's log
        setModalVisible(true);
    };

    const handleSaveLog = () => {
        if (!selectedTask) return;

        const today = new Date().toISOString().split('T')[0];
        
        // Remove existing log for today if any (to support toggle off or update)
        // In a real DB we would upsert. Here in mock array we filter out then push.
        const existingLogIndex = LOGS.findIndex(l => l.habit_id === selectedTask.id && l.date === today);
        if (existingLogIndex > -1) {
            LOGS.splice(existingLogIndex, 1);
        }

        // Add new log if done
        if (isDone) {
            LOGS.push({
                id: `l_${selectedTask.id}_${Date.now()}`,
                habit_id: selectedTask.id,
                user_id: 'u1',
                date: today,
                value: true,
                text: logNote.trim() || undefined,
                updated_at: new Date().toISOString(),
            });
        }
        
        setRefreshKey(prev => prev + 1);
        setModalVisible(false);
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
                {/* Radar Chart Section */}
                <View className="px-6 mb-8">
                    <View className="border-2 border-primary p-4">
                        <Text className="text-white text-base font-bold font-mono mb-1">Life Radar</Text>
                        <Text className="text-primary opacity-70 text-sm font-mono mb-4">Weekly</Text>
                        
                        <View className="items-center justify-center py-6">
                            <BrutalistRadarChart 
                                data={RADAR_DATA.data} 
                                labels={RADAR_DATA.labels}
                                size={250}
                                color={PRIMARY_COLOR}
                            />
                        </View>
                    </View>
                </View>

                {/* Today's List */}
                <View>
                    <Text className="px-6 pb-3 pt-5 text-[22px] font-bold text-white font-mono tracking-tighter">Today</Text>
                    <View className="bg-[#222] gap-[1px]"> 
                        {sortedTasks.map((item, index) => (
                            <TouchableOpacity 
                                key={item.id} 
                                onPress={() => openLogModal(item)}
                                className="flex-row items-center justify-between bg-black px-6 py-4"
                            >
                                <View className="flex-1 flex-row items-center gap-4">
                                    <View style={{ backgroundColor: item.color }} className={`h-2 w-2`} />
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
                <View className="bg-black w-[90%] border border-[#333] p-6 pb-8">
                     <View className="items-center mb-8 relative">
                         {/* Close Button Top Right */}
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)}
                            className="absolute -top-2 -right-2 p-2"
                        >
                            <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>

                        <Text className="text-white text-2xl font-bold font-jb-bold text-center mb-1">
                             {selectedTask?.text}
                        </Text>
                        <Text className="text-[#888] text-xs font-mono text-center uppercase tracking-widest">
                             Goal: {selectedTask?.categoryName || 'General'}
                        </Text>
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

                     {/* Save Button */}
                     <TouchableOpacity 
                        onPress={handleSaveLog}
                        className={`w-full h-14 items-center justify-center active:opacity-90 ${isDone ? 'bg-[#39FF14]' : 'bg-[#222]'}`}
                    >
                         <Text className={`font-bold font-jb-bold uppercase tracking-widest text-lg ${isDone ? 'text-black' : 'text-[#666]'}`}>
                             SAVE LOG
                         </Text>
                     </TouchableOpacity>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
