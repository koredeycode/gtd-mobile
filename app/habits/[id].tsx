import { ScreenWrapper } from '@/components/ScreenWrapper';
import { getDB } from '@/db';
import { Category, Habit, Log } from '@/db/types';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Modal from 'react-native-modal';

export default function HabitDetailScreen() {
    const { id } = useLocalSearchParams();
    const [period, setPeriod] = useState<'30D' | '6M' | '1Y'>('30D');
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<any>(null);
    
    const [habit, setHabit] = useState<Habit | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [logs, setLogs] = useState<Log[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const db = await getDB();
            const habitResult = await db.getAllAsync<Habit>('SELECT * FROM habits WHERE id = ?', [String(id)]);
            if (habitResult.length > 0) {
                setHabit(habitResult[0]);
                const catResult = await db.getAllAsync<Category>('SELECT * FROM categories WHERE id = ?', [habitResult[0].category_id]);
                if (catResult.length > 0) setCategory(catResult[0]);
            } else {
                setHabit(null);
            }

            const logsResult = await db.getAllAsync<Log>('SELECT * FROM logs WHERE habit_id = ?', [String(id)]);
            setLogs(logsResult);
        } catch (error) {
            console.error('Error fetching habit details:', error);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );
    
    // Get logs for this habit (only done ones for stats/calendar? Original logic filtered l.value)
    // We'll keep compatibility by filtering here
    const habitLogs = useMemo(() => {
        return logs.filter(l => l.value);
    }, [logs]);

    // Calculate Date Range Limit based on period
    const rangeLimitDate = useMemo(() => {
        const d = new Date();
        if (period === '30D') d.setDate(d.getDate() - 30);
        if (period === '6M') d.setMonth(d.getMonth() - 6);
        if (period === '1Y') d.setFullYear(d.getFullYear() - 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [period]);

    // Calculate stats based on period
    const stats = useMemo(() => {
        if (!habit) return { streak: 0, completion: 0, total: 0 };
        
        // Calculate Streak
        let currentStreak = 0;
        const today = new Date();
        let checkDate = new Date(today);
        let checkDateStr = checkDate.toISOString().split('T')[0];
        
        const doneDates = new Set(habitLogs.map(l => l.date));
        
        // If not done today, check if done yesterday to sustain streak
        if (!doneDates.has(checkDateStr)) {
             checkDate.setDate(checkDate.getDate() - 1);
             checkDateStr = checkDate.toISOString().split('T')[0];
        }
        
        while (doneDates.has(checkDateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            checkDateStr = checkDate.toISOString().split('T')[0];
        }

        // Filter logs within range
        const logsInRange = habitLogs.filter(l => {
            const d = new Date(l.date);
            return d >= rangeLimitDate;
        });

        const totalDone = logsInRange.length;
        
        // Estimate total days in range
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - rangeLimitDate.getTime());
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // Completion
        const completion = totalDays > 0 ? Math.round((totalDone / totalDays) * 100) : 0;

        return {
            streak: currentStreak,
            completion: Math.min(completion, 100),
            total: totalDone
        };
    }, [habit, habitLogs, rangeLimitDate]);

    // Format logs for Calendar markedDates
    const markedDates = useMemo(() => {
        const marked: any = {};
        const today = new Date();
        const maxDate = new Date().toISOString().split('T')[0];
        const minDate = rangeLimitDate.toISOString().split('T')[0];

        // Mark done days
        habitLogs.forEach(l => {
            if (l.date >= minDate && l.date <= maxDate) {
                 marked[l.date] = { 
                    selected: true, 
                    marked: true, 
                    selectedColor: '#39FF14', 
                    dotColor: 'transparent',
                    log: l // Store log for retrieval
                };
            }
        });
        
        // Mark today if not done? Optional.
        // We'll just rely on `onDayPress` logic to handle empty days.
        return marked;
    }, [habitLogs, rangeLimitDate]);

    const handleDayPress = (day: any) => {
        const log = habitLogs.find(l => l.date === day.dateString);
        // Create a temporary object for selectedLog even if no log exists (for Not Done)
        setSelectedLog(log || { date: day.dateString, value: false });
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
                <View className="items-center">
                    <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                        {habit.title}
                    </Text>
                    <Text className="text-[#888888] text-xs font-mono uppercase mt-1 tracking-widest">
                        {category?.name || 'UNCATEGORIZED'}
                    </Text>
                </View>
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
                            COMPLETION ({period})
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
                        {(['30D', '6M', '1Y'] as const).map((p) => (
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
                        <View className="flex-row items-baseline justify-between mb-4">
                             <Text className="text-white text-sm font-bold uppercase tracking-widest font-jb-bold">
                                PROGRESS ({period})
                            </Text>
                            <Text className="text-[#888888] text-xs font-mono">
                                    {rangeLimitDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                                    {' - '} 
                                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                        
                        <Calendar 
                            key={period} // Re-render when period changes
                            markedDates={markedDates}
                            onDayPress={handleDayPress}
                            minDate={rangeLimitDate.toISOString().split('T')[0]}
                            maxDate={new Date().toISOString().split('T')[0]}
                            theme={{
                                backgroundColor: '#000000',
                                calendarBackground: '#000000',
                                textSectionTitleColor: '#ffffff',
                                selectedDayBackgroundColor: '#39FF14',
                                selectedDayTextColor: '#000000',
                                todayTextColor: '#39FF14',
                                dayTextColor: '#ffffff',
                                textDisabledColor: '#333333',
                                dotColor: '#39FF14',
                                selectedDotColor: '#ffffff',
                                arrowColor: '#39FF14',
                                monthTextColor: '#39FF14',
                                indicatorColor: '#39FF14',
                                textDayFontFamily: 'JetBrainsMono-Bold',
                                textMonthFontFamily: 'JetBrainsMono-Bold',
                                textDayHeaderFontFamily: 'JetBrainsMono-Bold',
                                textDayFontWeight: '300',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '300',
                                textDayFontSize: 14,
                                textMonthFontSize: 14,
                                textDayHeaderFontSize: 12
                            }}
                            enableSwipeMonths={true}
                        />

                         {/* Legend */}
                         <View className="flex-row items-center mt-6 gap-6 justify-start border-t border-[#333333] pt-4">
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-[#39FF14] rounded-full" />
                                 <Text className="text-white text-xs font-bold uppercase tracking-wider font-jb-bold">DONE</Text>
                             </View>
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-transparent border border-white rounded-full" />
                                 <Text className="text-white text-xs font-bold uppercase tracking-wider font-jb-bold">NOT DONE</Text>
                             </View>
                         </View>
                    </View>
                </View>

                {/* Footer Edit Button */}
                <View className="px-6">
                    <TouchableOpacity 
                        onPress={() => router.push({ pathname: '/habits/manage', params: { id } })}
                        className="border border-white h-14 items-center justify-center flex-row gap-2 active:bg-[#222]"
                    >
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
