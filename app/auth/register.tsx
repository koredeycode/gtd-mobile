import { Oauth } from '@/components/auth/Oauth';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../../services';

export default function RegisterScreen() {
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await authService.register({
                email,
                password,
                firstName,
                lastName,
            });
            Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.replace('/auth/login') }
            ]);
        } catch (error) {
            Alert.alert('Registration Failed', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-black">
             <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="mb-8 pt-6">
                    <Text className="text-[#E0E0E0] tracking-wider text-[32px] font-bold leading-tight text-center font-display">
                        GET THINGS DONE
                    </Text>
                </View>
                <View className="w-full max-w-sm mx-auto mb-8">
                    <Input label="FIRST NAME" value={firstName} onChangeText={setFirstName} />
                    <Input label="LAST NAME" value={lastName} onChangeText={setLastName} />
                    <Input label="EMAIL" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <Input label="PASSWORD" value={password} onChangeText={setPassword} isPassword />
                    <Input label="CONFIRM PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} isPassword />
                </View>

                <Button 
                    label="CREATE ACCOUNT" 
                    onPress={handleRegister} 
                    disabled={loading}
                    className="mb-8"
                />

                <Oauth />

                 <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                    <Text className="text-[#E0E0E0] text-sm font-normal leading-normal text-center underline font-mono">
                        ALREADY HAVE AN ACCOUNT?
                    </Text>
                </TouchableOpacity>
                <View className="mt-auto items-center pt-8">
                    <View className="flex-row gap-6">
                        <Text className="text-[#E0E0E0] text-xs underline font-mono">Terms of Service</Text>
                        <Text className="text-[#E0E0E0] text-xs underline font-mono">Privacy Policy</Text>
                    </View>
                </View>
             </ScrollView>
        </ScreenWrapper>
    );
}
