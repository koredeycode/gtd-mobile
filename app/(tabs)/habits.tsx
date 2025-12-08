import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Category, Habit } from '@/db/types';
import { CategoryService } from '@/services/CategoryService';
import { HabitService } from '@/services/HabitService';

const HabitsScreen = () => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    const fetchData = useCallback(async () => {
        try {
            const [fetchedHabits, fetchedCategories] = await Promise.all([
                HabitService.getAllHabits(),
                CategoryService.getAllCategories()
            ]);
            setHabits(fetchedHabits);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('Failed to fetch habits data:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Group habits by category
    const { activeGroups, archivedList } = useMemo(() => {
        const active: Record<string, any> = {};
        const archived: any[] = [];

        habits.forEach(habit => {
            const category = categories.find(c => c.id === habit.category_id);
            const uiHabit = {
                id: habit.id,
                name: habit.title,
                color: category?.color || '#FFF',
                categoryName: category?.name || 'General',
                categoryId: category?.id,
                streak: 0 
            };
            
            // TODO: Implement actual archive filtering when/if 'is_archived' logic is fully exposed in UI
            if (activeTab === 'active' && !habit.is_archived) { 
                if (!active[uiHabit.categoryName]) {
                    active[uiHabit.categoryName] = {
                        title: uiHabit.categoryName,
                        categoryId: uiHabit.categoryId,
                        habits: []
                    };
                }
                active[uiHabit.categoryName].habits.push(uiHabit);
            } else if (activeTab === 'archived' && habit.is_archived) {
                // Add to archived list
            }
        });
        
        return {
            activeGroups: Object.values(active),
            archivedList: archived 
        };
    }, [habits, categories, activeTab]);

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
                        {activeGroups.length === 0 ? (
                            <Text className="text-[#666] text-center font-mono mt-10">No active habits.</Text>
                        ) : (
                        activeGroups.map((category: any) => (
                            <View key={category.title} className="mb-8">
                                {/* Category Header */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-[#666666] text-sm font-bold uppercase tracking-widest font-jb-bold">
                                        {category.title}
                                    </Text>
                                    <TouchableOpacity 
                                        onPress={() => router.push({ pathname: '/habits/manage', params: { categoryId: category.categoryId } })}
                                        className="border border-[#39FF14] p-1"
                                    >
                                        <MaterialIcons name="add" size={16} color="#39FF14" />
                                    </TouchableOpacity>
                                </View>
                                
                                {/* Habits List */}
                                <View>
                                    {category.habits.map((habit: any) => (
                                        <TouchableOpacity 
                                            key={habit.id}
                                            onPress={() => router.push({ pathname: '/habits/[id]', params: { id: habit.id } })}
                                            className="flex-row gap-16 items-center justify-between py-4 border-b border-[#333333]"
                                        >
                                            <View className="flex-row items-center gap-4 flex-1">
                                                <View style={{ backgroundColor: habit.color }} className="h-3 w-3 rounded-full flex-shrink-0" />
                                                <Text 
                                                    className="text-white text-base font-normal font-mono"
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
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
                        ))
                        )}
                    </View>
                ) : (
                    <View className="p-6">
                         <Text className="text-[#666] text-center font-mono mt-10">Archived habits not supported yet.</Text>
                         {/* Archived list implementation pending schema update */}
                    </View>
                )}
            </ScrollView>

             {/* FAB */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity 
                    onPress={() => router.push('/habits/manage')}
                    className="h-14 w-14 items-center justify-center border-2 border-[#39FF14] bg-black shadow-lg shadow-[#39FF14]/20 active:bg-[#39FF14]/20"
                >
                    <MaterialIcons name="add" size={32} color="#39FF14" />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

export default HabitsScreen;
