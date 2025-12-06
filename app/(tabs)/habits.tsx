import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ACTIVE_HABITS = [
    {
        title: 'MIND',
        habits: [
            { id: 1, name: 'Meditate Daily', streak: 7, color: '#FF007A' },
            { id: 2, name: 'Journaling', streak: 3, color: '#FF007A' },
        ]
    },
    {
        title: 'BODY',
        habits: [
            { id: 3, name: 'Workout 3x/week', streak: 21, color: '#00E0FF' },
            { id: 4, name: 'Drink 2L Water', streak: 88, color: '#00E0FF' },
        ]
    },
    {
        title: 'GROWTH',
        habits: [
            { id: 5, name: 'Read 10 pages', streak: 14, color: '#FF9900' },
            { id: 6, name: 'Code for 1 hour', streak: 52, color: '#FF9900' },
        ]
    }
];

const ARCHIVED_HABITS = [
    { id: 101, name: 'Finish Novel', color: '#9d174d' },
    { id: 102, name: 'Learn Guitar', color: '#0e7490' },
    { id: 103, name: 'Run a 5K', color: '#a16207' },
    { id: 104, name: 'Save $1000', color: '#0e7490' },
];

export default function HabitsScreen() {
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header - Matching Settings Screen Style */}
             <View className="flex-row items-center justify-center pt-6 pb-4 border-b border-[#333333]">
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    HABITS
                </Text>
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
                        {ACTIVE_HABITS.map((category) => (
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
                                    {category.habits.map((habit) => (
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
                         {ARCHIVED_HABITS.map((habit) => (
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
                <TouchableOpacity className="h-14 w-14 items-center justify-center bg-[#39FF14]">
                    <MaterialIcons name="add" size={32} color="black" />
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
}
