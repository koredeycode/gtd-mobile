import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistSwitch } from '@/components/ui/BrutalistSwitch';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SECTIONS = [
    {
        header: 'REMINDERS',
        items: [
            { id: 'reminders', label: 'Habit Reminders', icon: 'notifications', default: true },
        ]
    },
    {
        header: 'PROGRESS',
        items: [
            { id: 'streaks', label: 'Streak Alerts', icon: 'whatshot', default: true },
            { id: 'summaries', label: 'Progress Summaries', icon: 'calendar-today', default: false },
        ]
    },
    {
        header: 'APP',
        items: [
            { id: 'updates', label: 'App Updates & News', icon: 'campaign', default: false },
        ]
    }
];

export default function NotificationsScreen() {
    // State to track toggles. In a real app, this would be persisted.
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        reminders: true,
        streaks: true,
        summaries: false,
        updates: false,
    });

    const toggleSwitch = (id: string) => {
        setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <ScreenWrapper bg="bg-black">
             {/* Header */}
             <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    NOTIFICATIONS
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="p-4 gap-8">
                    {SECTIONS.map((section) => (
                        <View key={section.header}>
                            <Text className="text-[#666666] text-xs font-bold uppercase tracking-widest mb-3 pl-2 font-jb-bold">
                                {section.header}
                            </Text>
                            <View className="border border-[#333333]">
                                {section.items.map((item, index) => (
                                    <View 
                                        key={item.id}
                                        className={`flex-row items-center justify-between p-4 bg-black ${
                                            index !== section.items.length - 1 ? 'border-b border-[#333333]' : ''
                                        }`}
                                    >
                                        <View className="flex-row items-center gap-4">
                                            <MaterialIcons 
                                                name={item.icon as any} 
                                                size={24} 
                                                color="white" 
                                            />
                                            <Text className="text-base font-normal font-mono text-white">
                                                {item.label}
                                            </Text>
                                        </View>
                                        
                                        <BrutalistSwitch
                                            value={toggles[item.id]}
                                            onValueChange={() => toggleSwitch(item.id)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
