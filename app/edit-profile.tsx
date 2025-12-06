import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
    const [name, setName] = useState('Alex Mercer');
    const [email, setEmail] = useState('alex.mercer@gsd.app');
    const [password, setPassword] = useState('');

    const handleSave = () => {
        // Mock save
        Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    EDIT PROFILE
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {/* Avatar with Edit Icon */}
                <View className="items-center mb-10">
                    <View className="h-32 w-32 justify-center items-center border-4 border-[#39FF14] relative bg-[#C4C4C4]">
                        <MaterialIcons name="person" size={80} color="white" />
                        
                        <TouchableOpacity className="absolute -bottom-3 -right-3 bg-black border border-[#39FF14] p-2">
                             <MaterialIcons name="edit" size={16} color="#39FF14" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form Fields */}
                <View className="gap-8 mb-12">
                    <View>
                        <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                            NAME
                        </Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            className="bg-black border border-[#39FF14] text-white p-4 font-mono text-base"
                            placeholderTextColor="#444"
                        />
                    </View>

                    <View>
                        <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                            EMAIL
                        </Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            className="bg-black border border-[#39FF14] text-white p-4 font-mono text-base"
                            placeholderTextColor="#444"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-jb-bold">
                            PASSWORD
                        </Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter new password"
                            placeholderTextColor="#666"
                            className="bg-black border border-[#39FF14] text-white p-4 font-mono text-base"
                            secureTextEntry
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                    onPress={handleSave}
                    className="w-full bg-[#39FF14] p-4 items-center active:opacity-90"
                >
                    <Text className="text-black font-bold font-jb-bold uppercase tracking-widest text-base">
                        SAVE CHANGES
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
}
