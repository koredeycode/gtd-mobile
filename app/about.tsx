import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    ABOUT
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
                <View className="flex flex-col justify-between h-full">

                <View className="items-center mt-12 mb-8">
                    {/* Logo Box */}
                    <View className="border-2 border-[#39FF14] px-8 py-4 mb-6">
                        <Text className="text-[#39FF14] text-5xl font-black tracking-tighter font-jb-bold">
                            GSD
                        </Text>
                    </View>
                    <Text className="text-[#666666] font-mono text-xs uppercase tracking-widest">
                        VERSION 1.0.0 (20240401)
                    </Text>
                </View>
<View>

                {/* Links */}
                <View className="border border-[#333333] mx-6 mt-8">
                    {[
                        { label: 'Terms of Service', route: '/legal/terms' },
                        { label: 'Privacy Policy', route: '/legal/privacy' },
                        { label: 'Open Source Licenses', route: '/legal/licenses' },
                    ].map((item, index, arr) => (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => router.push(item.route as any)}
                            className={`flex-row items-center justify-between p-4 bg-black ${
                                index !== arr.length - 1 ? 'border-b border-[#333333]' : ''
                            }`}
                        >
                            <Text className="text-white text-base font-normal font-mono">
                                {item.label}
                            </Text>
                            <MaterialIcons name="chevron-right" size={24} color="#666666" />
                        </TouchableOpacity>
                    ))}
                </View>
                
                <View className="flex-1 justify-end items-center pb-8 mt-12">
                     <Text className="text-[#444444] font-mono text-[10px] uppercase tracking-widest text-center leading-5">
                        © 2024 GSD INDUSTRIES.{'\n'}GET THINGS DONE.
                    </Text>
                </View>
</View>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}
