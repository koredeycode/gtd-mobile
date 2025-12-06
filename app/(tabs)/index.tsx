import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistRadarChart } from '@/components/ui/BrutalistRadarChart';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
// Safely access colors, falling back if not found.  
// In a real app, you might have strong typing for your theme.
// @ts-ignore
const PRIMARY_COLOR = fullConfig.theme?.extend?.colors?.primary || '#39FF14';

export default function DashboardScreen() {
    const radarSize = 250;
    
    return (
        <ScreenWrapper bg="bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-2 pb-6">
                <Text className="text-primary text-lg font-bold tracking-tight font-jb-bold">
                    MON, 28 OCT
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
                                data={[80, 65, 70, 90, 60, 75]} 
                                labels={['Work', 'Mind', 'Finance', 'Health', 'Social', 'Habits']}
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
                        {[
                            { color: 'bg-[#FF3B30]', text: 'Meditate for 10 minutes', done: true },
                            { color: 'bg-[#007AFF]', text: 'Read 1 chapter', done: false },
                            { color: 'bg-[#FF9500]', text: '30 minutes of cardio', done: false },
                            { color: 'bg-[#AF52DE]', text: "Plan tomorrow's tasks", done: false }
                        ].map((item, index) => (
                            <View key={index} className="flex-row items-center justify-between bg-black px-6 py-4">
                                <View className="flex-1 flex-row items-center gap-4">
                                    <View className={`h-2 w-2 ${item.color}`} />
                                    <Text className="text-white text-base font-mono" numberOfLines={1}>
                                        {item.text}
                                    </Text>
                                </View>
                                <View className={cn(
                                    "h-6 w-6 border-2 border-primary items-center justify-center",
                                    item.done ? "bg-primary" : "bg-transparent"
                                )}>
                                    {item.done && <MaterialIcons name="check" size={18} color="black" />}
                                </View>
                            </View>
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
