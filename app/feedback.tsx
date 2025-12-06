import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FeedbackScreen() {
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!feedback.trim()) {
            Alert.alert('Error', 'Please enter your feedback first.');
            return;
        }

        setSending(true);
        // Simulate API call
        setTimeout(() => {
            setSending(false);
            Alert.alert('Thank You', 'Your feedback has been sent successfully.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <ScreenWrapper bg="bg-black">
             {/* Header */}
             <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    FEEDBACK
                </Text>
                <View className="w-6" /> 
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
                    <Text className="text-white text-xs font-bold font-jb-bold uppercase tracking-widest mb-4">
                        YOUR FEEDBACK
                    </Text>
                    
                    <TextInput
                        className="w-full h-64 border border-[#333333] bg-black text-white p-4 font-mono text-base mb-8"
                        placeholder="Tell us what you think..."
                        placeholderTextColor="#666666"
                        multiline
                        textAlignVertical="top"
                        value={feedback}
                        onChangeText={setFeedback}
                    />

                    <Text className="text-white text-xs font-bold font-jb-bold uppercase tracking-widest mb-4">
                        EMAIL (OPTIONAL)
                    </Text>
                    
                    <TextInput
                        className="w-full h-14 border border-[#333333] bg-black text-white px-4 font-mono text-base mb-8"
                        placeholder="for follow-up"
                        placeholderTextColor="#666666"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View className="flex-1 justify-end pb-8">
                        <TouchableOpacity 
                            className={`w-full h-14 bg-[#39FF14] flex-row items-center justify-center space-x-2 ${sending ? 'opacity-70' : ''}`}
                            onPress={handleSend}
                            disabled={sending}
                            activeOpacity={0.8}
                        >
                            <Text className="text-black text-base font-bold uppercase tracking-wider font-jb-bold">
                                {sending ? 'SENDING...' : 'SEND'}
                            </Text>
                            {!sending && <MaterialIcons name="send" size={20} color="black" />}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
