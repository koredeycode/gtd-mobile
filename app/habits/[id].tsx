import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Mock data generation for calendar
const generateMockCalendar = () => {
    const data = [];
    for (let i = 0; i < 35; i++) { // 5 rows * 7 days
        // Randomly assign status: 0=empty, 1=done, 2=missed
        const rand = Math.random();
        if (i > 31) data.push(0); // Future/Empty
        else if (rand > 0.3) data.push(1); // Done
        else data.push(2); // Missed
    }
    return data;
};

export default function HabitDetailScreen() {
    const { id } = useLocalSearchParams();
    const [period, setPeriod] = useState('30D');
    const [isModalVisible, setModalVisible] = useState(false);
    const mockCalendarData = generateMockCalendar();

    const toggleModal = () => setModalVisible(!isModalVisible);

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    WORKOUT {/* dynamic in real app */}
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
                            14 DAYS
                        </Text>
                    </View>
                    
                    <View className="mb-6">
                         <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-1 font-jb-bold">
                            COMPLETION
                        </Text>
                        <Text className="text-white text-3xl font-bold font-jb-bold">
                            92%
                        </Text>
                    </View>

                    <View>
                         <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-1 font-jb-bold">
                            TOTAL DONE
                        </Text>
                        <Text className="text-white text-3xl font-bold font-jb-bold">
                            28
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
                        
                        {/* Month Nav */}
                        <View className="flex-row items-center justify-between mb-4 px-2">
                             <MaterialIcons name="chevron-left" size={24} color="#888888" />
                             <Text className="text-[#39FF14] font-mono font-bold uppercase tracking-widest">
                                 MAY 2024
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
                             {mockCalendarData.map((status, index) => (
                                 <TouchableOpacity 
                                    key={index}
                                    onPress={toggleModal}
                                    className={`w-8 h-8 mb-1 ${
                                        status === 1 ? 'bg-[#39FF14]' : 
                                        status === 2 ? 'bg-[#444444]' : 'bg-black border border-[#222]'
                                    }`}
                                 />
                             ))}
                        </View>

                         {/* Legend */}
                         <View className="flex-row items-center mt-6 gap-6 justify-start border-t border-[#333333] pt-4">
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-[#39FF14]" />
                                 <Text className="text-white text-xs font-bold uppercase tracking-wider font-jb-bold">DONE</Text>
                             </View>
                             <View className="flex-row items-center gap-2">
                                 <View className="w-4 h-4 bg-[#444444]" />
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
                                <MaterialIcons name="check-circle" size={24} color="#39FF14" />
                                <Text className="text-white text-xl font-bold font-jb-bold uppercase">
                                    DONE
                                </Text>
                            </View>
                        </View>

                        {/* Date */}
                        <View className="mb-6">
                             <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                                DATE
                            </Text>
                            <Text className="text-white text-2xl font-bold font-jb-bold uppercase">
                                JUL 25
                            </Text>
                        </View>

                        {/* Context */}
                        <View className="mb-8">
                             <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                                TEXT CONTEXT
                            </Text>
                            <Text className="text-white text-base font-normal font-mono leading-6">
                                Read the first three chapters of "The Brutalist Web".
                            </Text>
                        </View>

                        {/* Share Button */}
                        <TouchableOpacity className="w-full bg-[#39FF14] h-14 flex-row items-center justify-center space-x-2">
                            <MaterialIcons name="share" size={20} color="black" />
                            <Text className="text-black font-bold font-jb-bold uppercase tracking-widest">
                                SHARE ACHIEVEMENT
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
