import { ScreenWrapper } from '@/components/ScreenWrapper';
import { CATEGORIES, HABITS, LOGS } from '@/constants/mockData';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitDetailScreen() {
    const { id } = useLocalSearchParams();
    const [period, setPeriod] = useState('30D');
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    const habit = useMemo(() => HABITS.find(h => h.id === id), [id]);
    const category = useMemo(() => CATEGORIES.find(c => c.id === habit?.category_id), [habit]);
    
    // Get logs for this habit
    const habitLogs = useMemo(() => {
        return LOGS.filter(l => l.habit_id === id && l.value);
    }, [id]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!habit) return { streak: 0, completion: 0, total: 0 };
        
        const totalDone = habitLogs.length;
        // Simple completion rate based on last 30 days for now
        // In real app, would be based on frequency
        const completion = Math.round((habitLogs.filter(l => {
            const d = new Date(l.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - d.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays <= 30;
        }).length / 30) * 100);

        return {
            streak: habit.streak || 0,
            completion: Math.min(completion, 100),
            total: totalDone
        };
    }, [habit, habitLogs]);

    // Generate Calendar Data (Last 105 days = 15 weeks)
    const calendarData = useMemo(() => {
        const days = [];
        const today = new Date();
        // Start 104 days ago
        for (let i = 104; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const log = habitLogs.find(l => l.date === dateStr);
            
            days.push({
                date: dateStr,
                status: log ? 1 : 2, // 1=Done, 2=Not Done
                log: log || { date: dateStr, value: false } // Create dummy log for Not Done
            });
        }
        return days;
    }, [habitLogs]);

    const handleDayPress = (day: any) => {
        // Allow clicking any day (Done or Not Done)
        setSelectedLog(day.log);
        setModalVisible(true);
    };

    const toggleModal = () => setModalVisible(!isModalVisible);

    if (!habit) {
        return (
            <ScreenWrapper bg="bg-black">
                 <View className="flex-1 items-center justify-center">
                    <Text className="text-white">Habit not found</Text>
                 </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    {habit.title}
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Stats Overview */}
                <View className="px-6 py-6 border-b border-[#333333]">
                    <View className="mb-6">
                        <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-1 font-jb-bold">
                            CURRENT STREAK
                        </Text>
                        <Text className="text-white text-3xl font-bold font-jb-bold">
                            {stats.streak} DAYS
                        </Text>
                    </View>
                    
                    <View className="mb-6">
                         <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-1 font-jb-bold">
                            COMPLETION (30D)
                        </Text>
                        <Text className="text-white text-3xl font-bold font-jb-bold">
                            {stats.completion}%
                        </Text>
                    </View>

                    <View>
                         <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-1 font-jb-bold">
                            TOTAL DONE
                        </Text>
                        <Text className="text-white text-3xl font-bold font-jb-bold">
                            {stats.total}
                        </Text>
                    </View>
                </View>

                {/* Period Selector */}
                <View className="px-6 py-6">
                    <View className="flex-row border border-[#333333] h-12">
                        {['7D', '30D', 'ALL'].map((p) => (
                            <TouchableOpacity 
                                key={p} 
                                onPress={() => setPeriod(p)}
                                className={`flex-1 items-center justify-center ${
                                    period === p ? 'bg-[#39FF14]' : 'bg-transparent'
                                }`}
                            >
                                <Text className={`font-bold font-mono ${
                                    period === p ? 'text-black' : 'text-white'
                                }`}>
                                    {p}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Calendar Section */}
                <View className="px-6 mb-8">
                    <View className="border border-[#333333] p-4">
                        <Text className="text-white text-sm font-bold uppercase tracking-widest mb-4 font-jb-bold">
                            PROGRESS OVER TIME
                        </Text>
                        
                        {/* Month Nav - Simplified to Current Month for Mock */}
                        <View className="flex-row items-center justify-between mb-4 px-2">
                             <MaterialIcons name="chevron-left" size={24} color="#888888" />
                             <Text className="text-[#39FF14] font-mono font-bold uppercase tracking-widest">
                                 LAST 15 WEEKS
                             </Text>
                             <MaterialIcons name="chevron-right" size={24} color="#888888" />
                        </View>

                        {/* Grid Header */}
                        <View className="flex-row justify-between mb-2">
                            {DAYS.map((d, i) => (
                                <Text key={i} className="text-white font-mono text-center w-8 text-xs font-bold">
                                    {d}
                                </Text>
                            ))}
                        </View>

                        {/* Grid Body */}
                        <View className="flex-row flex-wrap justify-between gap-y-1">
                             {calendarData.map((day, index) => (
                                 <TouchableOpacity 
                                    key={index}
                                    onPress={() => handleDayPress(day)}
                                    className={`w-8 h-8 mb-1 items-center justify-center ${
                                        day.status === 1 ? 'bg-[#39FF14]' : 
                                        'bg-[#222] border border-[#333]'
                                    }`}
                                 >
                                    {/* Optional: Show day number for better context? Or just keep simple blocks */}
                                 </TouchableOpacity>
                             ))}
                        </View>

                         {/* Legend */}
                         <View className="flex-row items-center mt-6 gap-6 justify-start border-t border-[#333333] pt-4">
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-[#39FF14]" />
                                 <Text className="text-white text-xs font-bold uppercase tracking-wider font-jb-bold">DONE</Text>
                             </View>
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-[#222] border border-[#333]" />
                                 <Text className="text-white text-xs font-bold uppercase tracking-wider font-jb-bold">NOT DONE</Text>
                             </View>
                         </View>
                    </View>
                </View>

                {/* Footer Edit Button */}
                <View className="px-6">
                    <TouchableOpacity className="border border-white h-14 items-center justify-center flex-row gap-2 active:bg-[#222]">
                        <MaterialIcons name="edit" size={20} color="white" />
                        <Text className="text-white text-base font-bold uppercase tracking-widest font-jb-bold">
                            EDIT
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Detail Modal */}
            <Modal
                isVisible={isModalVisible}
                onBackdropPress={toggleModal}
                backdropOpacity={0.8}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
            >
                <View className="bg-black border border-[#666666]">
                    {/* Modal Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-[#666666]">
                        <Text className="text-white font-bold font-jb-bold uppercase tracking-widest text-lg">
                            DETAILS
                        </Text>
                        <TouchableOpacity onPress={toggleModal} className="border border-[#666666] p-1">
                             <MaterialIcons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Modal Content */}
                    <View className="p-6">
                        {/* Status */}
                        <View className="mb-6">
                            <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                                STATUS
                            </Text>
                            <View className="flex-row items-center space-x-2">
                                <MaterialIcons 
                                    name={selectedLog?.value ? "check-circle" : "cancel"} 
                                    size={24} 
                                    color={selectedLog?.value ? "#39FF14" : "#666"} 
                                />
                                <Text className={`text-xl font-bold font-jb-bold uppercase ${selectedLog?.value ? "text-white" : "text-[#666]"}`}>
                                    {selectedLog?.value ? "DONE" : "NOT DONE"}
                                </Text>
                            </View>
                        </View>

                        {/* Date */}
                        <View className="mb-6">
                             <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                                DATE
                            </Text>
                            <Text className="text-white text-2xl font-bold font-jb-bold uppercase">
                                {selectedLog?.date ? new Date(selectedLog.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </Text>
                        </View>

                        {/* Context */}
                        {selectedLog?.text && (
                            <View className="mb-8">
                                <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                                    TEXT CONTEXT
                                </Text>
                                <Text className="text-white text-base font-normal font-mono leading-6">
                                    {selectedLog.text}
                                </Text>
                            </View>
                        )}
                        {!selectedLog?.text && selectedLog?.value && (
                            <View className="mb-8">
                                 <Text className="text-[#666] text-sm font-normal font-mono italic">
                                    No notes for this session.
                                </Text>
                            </View>
                        )}

                        {/* Share Button (Only enabled if done?) or make it neutral */}
                         {selectedLog?.value && (
                            <TouchableOpacity className="w-full bg-[#39FF14] h-14 flex-row items-center justify-center space-x-2">
                                <MaterialIcons name="share" size={20} color="black" />
                                <Text className="text-black font-bold font-jb-bold uppercase tracking-widest">
                                    SHARE ACHIEVEMENT
                                </Text>
                            </TouchableOpacity>
                         )}
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
