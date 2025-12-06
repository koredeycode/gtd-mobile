import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
    {
        question: 'How do I add a new habit?',
        answer: "To add a new habit, navigate to the 'Tasks' screen and tap the floating action button at the bottom right. Fill in the details of your new habit, set a schedule, and tap 'Save'."
    },
    {
        question: 'Can I track weekly habits?',
        answer: "Yes, you can set custom schedules for your habits, including specific days of the week or a number of times per week."
    },
    {
        question: 'How are streaks calculated?',
        answer: "Streaks are calculated based on consecutive days of completing your habits. Miss a day, and the streak resets, unless you have a streak freeze active."
    },
    {
        question: 'How do I export my data?',
        answer: "Go to Settings > Data > Export Data to download a CSV file of your habit history and completion records."
    },
    {
        question: 'Is my data synced across devices?',
        answer: "Yes, if you are logged in, your data is automatically synced to the cloud and available on all your devices."
    }
];

function AccordionItem({ item, isOpen, onPress }: { item: typeof FAQS[0], isOpen: boolean, onPress: () => void }) {
    return (
        <View>
            <TouchableOpacity 
                onPress={onPress}
                className="flex-row items-center justify-between p-4 bg-black"
                activeOpacity={0.7}
            >
                <Text className="text-white text-base font-bold font-mono flex-1 mr-4">
                    {item.question}
                </Text>
                <MaterialIcons 
                    name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="white" 
                />
            </TouchableOpacity>
            {isOpen && (
                <View className="px-4 pb-4 bg-black">
                    <Text className="text-[#888888] text-sm font-mono leading-5">
                        {item.answer}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default function HelpScreen() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggle = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaqs = FAQS.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ScreenWrapper bg="bg-black">
             {/* Header */}
             <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    HELP & FAQ
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Search Bar */}
                <View className="flex-row items-center border border-[#333333] p-3 mb-6 bg-black">
                    <MaterialIcons name="search" size={24} color="#666666" />
                    <TextInput 
                        className="flex-1 ml-3 text-white font-mono text-base"
                        placeholder="Search for help..."
                        placeholderTextColor="#666666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* FAQ List */}
                <View className="border border-[#333333]">
                    {filteredFaqs.map((item, index) => (
                        <View key={index} className={index !== filteredFaqs.length - 1 ? 'border-b border-[#333333]' : ''}>
                            <AccordionItem 
                                item={item} 
                                isOpen={openIndex === index} 
                                onPress={() => handleToggle(index)} 
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
