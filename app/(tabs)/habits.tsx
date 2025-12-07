import { ScreenWrapper } from '@/components/ScreenWrapper';
import { CATEGORIES, HABITS } from '@/constants/mockData';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HabitsScreen() {
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    const activeHabits = useMemo(() => {
        const active = HABITS.filter(h => !h.deleted_at);
        // Group by category
        const groups = active.reduce((acc, habit) => {
            const category = CATEGORIES.find(c => c.id === habit.category_id);
            if (!category) return acc;
            
            if (!acc[category.name]) {
                acc[category.name] = {
                    title: category.name,
                    habits: []
                };
            }
            acc[category.name].habits.push({
                ...habit,
                color: category.color,
                name: habit.title // Map title to name for UI
            });
            return acc;
        }, {} as Record<string, any>);

        return Object.values(groups);
    }, []);

    const archivedHabits = useMemo(() => {
        return HABITS.filter(h => h.deleted_at).map(habit => {
            const category = CATEGORIES.find(c => c.id === habit.category_id);
            return {
                ...habit,
                color: category?.color || '#666',
                name: habit.title
            };
        });
    }, []);

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header - Matching Settings Screen Style */}
             <View className="flex-row items-center justify-between pt-6 pb-4 px-6 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()} disabled={!router.canGoBack()}>
                     <MaterialIcons name="arrow-back-ios" size={24} color={router.canGoBack() ? "white" : "transparent"} />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    HABITS
                </Text>
                 <View className="w-6" />
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-[#333333]">
                <TouchableOpacity 
                    onPress={() => setActiveTab('active')}
                    className={`flex-1 items-center py-4 border-b-2 ${
                        activeTab === 'active' ? 'border-[#39FF14]' : 'border-transparent'
                    }`}
                >
                    <Text className={`text-sm font-bold uppercase tracking-widest font-jb-bold ${
                        activeTab === 'active' ? 'text-[#39FF14]' : 'text-[#666666]'
                    }`}>
                        ACTIVE
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('archived')}
                    className={`flex-1 items-center py-4 border-b-2 ${
                        activeTab === 'archived' ? 'border-[#39FF14]' : 'border-transparent'
                    }`}
                >
                    <Text className={`text-sm font-bold uppercase tracking-widest font-jb-bold ${
                        activeTab === 'archived' ? 'text-[#39FF14]' : 'text-[#666666]'
                    }`}>
                        ARCHIVED
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-1">
                {activeTab === 'active' ? (
                    <View className="p-6">
                        {activeHabits.map((category: any) => (
                            <View key={category.title} className="mb-8">
                                {/* Category Header */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-[#666666] text-sm font-bold uppercase tracking-widest font-jb-bold">
                                        {category.title}
                                    </Text>
                                    <TouchableOpacity className="border border-[#39FF14] p-1">
                                        <MaterialIcons name="add" size={16} color="#39FF14" />
                                    </TouchableOpacity>
                                </View>
                                
                                {/* Habits List */}
                                <View>
                                    {category.habits.map((habit: any) => (
                                        <TouchableOpacity 
                                            key={habit.id}
                                            onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
                                            className="flex-row items-center justify-between py-4 border-b border-[#333333]"
                                        >
                                            <View className="flex-row items-center gap-4">
                                                <View style={{ backgroundColor: habit.color }} className="h-3 w-3 rounded-full" />
                                                <Text className="text-white text-base font-normal font-mono">
                                                    {habit.name}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center gap-1">
                                                <Text className="text-white text-base font-bold font-mono">
                                                    {habit.streak}
                                                </Text>
                                                <Text className="text-base">🔥</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="p-6">
                         {archivedHabits.map((habit: any) => (
                            <View 
                                key={habit.id}
                                className="flex-row items-center justify-between py-4 border-b border-[#333333]"
                            >
                                <View className="flex-row items-center gap-4">
                                    <View style={{ backgroundColor: habit.color }} className="h-3 w-3 rounded-full opacity-50" />
                                    <Text className="text-[#666666] text-base font-normal font-mono">
                                        {habit.name}
                                    </Text>
                                </View>
                                <TouchableOpacity>
                                     <MaterialIcons name="archive" size={20} color="#666666" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

             {/* FAB */}
             <View className="absolute bottom-6 right-6">
                <TouchableOpacity className="h-14 w-14 items-center justify-center border-2 border-[#39FF14] bg-black shadow-lg shadow-[#39FF14]/20 active:bg-[#39FF14]/20">
                    <MaterialIcons name="add" size={32} color="#39FF14" />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}
