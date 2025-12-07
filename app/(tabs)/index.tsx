import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistRadarChart } from '@/components/ui/BrutalistRadarChart';
import { CATEGORIES, HABITS, LOGS, RADAR_DATA } from '@/constants/mockData';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
// Safely access colors, falling back if not found.  
// In a real app, you might have strong typing for your theme.
// @ts-ignore
const PRIMARY_COLOR = fullConfig.theme?.extend?.colors?.primary || '#39FF14';

export default function DashboardScreen() {
    // Initial derived state 
    // In a real app with state management, this would be cleaner.
    // Here we need local state to show immediate updates on checkbox press.
    const [taskState, setTaskState] = useState<Record<string, boolean>>({});

    const todayTasks = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const activeHabits = HABITS.filter(h => !h.deleted_at);
        
        return activeHabits.map(habit => {
            const category = CATEGORIES.find(c => c.id === habit.category_id);
            const isDoneBackend = LOGS.some(l => l.habit_id === habit.id && l.date === today && l.value);
            
            // Should check local overrides
            // If key exists in taskState, use it. Else use backend.
            const isDone = taskState[habit.id] !== undefined ? taskState[habit.id] : isDoneBackend;
            
            return {
                id: habit.id,
                text: habit.title,
                color: category?.color || '#FFF',
                done: isDone
            };
        });
    }, [taskState]); // Recompute when local state changes

    const activeTasks = todayTasks.filter(t => !t.done);
    const completedTasks = todayTasks.filter(t => t.done);
    const sortedTasks = [...activeTasks, ...completedTasks];

    const toggleTask = (id: string, current: boolean) => {
        setTaskState(prev => ({
            ...prev,
            [id]: !current
        }));
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
                                onPress={() => router.push({ pathname: '/habits/[id]', params: { id: item.id } })}
                                className="flex-row items-center justify-between bg-black px-6 py-4"
                            >
                                <View className="flex-1 flex-row items-center gap-4">
                                    <View style={{ backgroundColor: item.color }} className={`h-2 w-2`} />
                                    <Text className="text-white text-base font-mono" numberOfLines={1}>
                                        {item.text}
                                    </Text>
                                </View>
                                {/* Checkbox area - prevent bubbling to row press? */}
                                <TouchableOpacity 
                                    onPress={() => toggleTask(item.id, item.done)}
                                    className={cn(
                                        "h-6 w-6 border-2 border-primary items-center justify-center",
                                        item.done ? "bg-primary" : "bg-transparent"
                                    )}
                                >
                                    {item.done && <MaterialIcons name="check" size={18} color="black" />}
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity className="h-14 w-14 items-center justify-center border-2 border-primary bg-black shadow-lg shadow-primary/20 active:bg-primary/20">
                    <MaterialIcons name="add" size={36} color={PRIMARY_COLOR} />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}
