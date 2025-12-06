import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const STATS = [
    { label: 'Current Streak', value: '14' },
    { label: 'Completions', value: '256' },
    { label: 'Rate', value: '92%' },
    { label: 'Longest Streak', value: '48' },
];

export default function ProfileScreen() {
    
    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('hasOnboarded'); // Optional: clear onboarding for testing
            router.replace('/auth/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <ScreenWrapper bg="bg-black">
             {/* Header */}
             <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    PROFILE
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
                {/* Avatar */}
                <View className="h-32 w-32 bg-[#C4C4C4] justify-center items-center border-4 border-[#39FF14] mb-6 relative">
                     {/* Placeholder for user image. Using icon for now */}
                     <MaterialIcons name="person" size={80} color="white" />
                </View>
                
                <Text className="text-white text-2xl font-bold font-jb-bold mb-1">Alex Mercer</Text>
                <Text className="text-[#888888] text-sm font-mono mb-8">alex.mercer@gsd.app</Text>

                {/* Stats Grid */}
                <View className="flex-row flex-wrap justify-between w-full mb-8">
                    {STATS.map((stat, index) => (
                        <View key={stat.label} className="w-[48%] h-32 border border-[#39FF14] p-4 justify-between mb-4">
                            <Text className="text-[#888888] text-xs font-mono">{stat.label}</Text>
                            <Text className="text-white text-4xl font-bold font-jb-bold">{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Edit Profile Button */}
                <TouchableOpacity 
                    onPress={() => router.push('/edit-profile')}
                    className="w-full h-14 bg-[#39FF14] flex-row items-center justify-center space-x-2 mb-4"
                 >
                    <MaterialIcons name="edit" size={20} color="black" />
                    <Text className="text-black text-base font-bold uppercase tracking-wider font-jb-bold">
                        EDIT PROFILE
                    </Text>
                 </TouchableOpacity>

                {/* Logout Button */}
                 <TouchableOpacity 
                    onPress={handleLogout}
                    className="w-full h-14 border border-[#39FF14] flex-row items-center justify-center space-x-2"
                 >
                    <MaterialIcons name="logout" size={20} color="#39FF14" />
                    <Text className="text-[#39FF14] text-base font-bold uppercase tracking-wider font-jb-bold">
                        LOG OUT
                    </Text>
                 </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
}
