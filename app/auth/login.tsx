import { Oauth } from '@/components/auth/Oauth';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { authService } from '../../services';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await authService.login({ email, password });
            
            // Navigate to sync screen to handle data fetching
            router.replace('/auth/sync');
        } catch (error) {
            Alert.alert('Login Failed', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-black">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="mb-12 pt-8">
                    <Text className="text-[#E0E0E0] tracking-wider text-[32px] font-bold leading-tight text-center font-display">
                        GET THINGS DONE
                    </Text>
                </View>
                {/* Inputs */}
                <View className="w-full max-w-sm mx-auto mb-8">
                    <Input 
                        label="EMAIL" 
                        value={email}
                        onChangeText={setEmail}
                        placeholder="example@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Input 
                        label="PASSWORD" 
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        isPassword
                    />
                </View>

                <Button 
                    label="EXECUTE" 
                    onPress={handleLogin} 
                    disabled={loading}
                    isLoading={loading}
                    className="mb-8"
                />

                <Oauth />

                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                    <Text className="text-[#E0E0E0] text-sm font-normal leading-normal text-center underline font-mono">
                        NEW USER?
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
