import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

import { authService } from '@/services/auth.service';

const checkAuthState = async () => {
    try {
        const onboarded = await SecureStore.getItemAsync('hasOnboarded');
        const token = await authService.getToken();

        // Simulate a small delay for splash effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (token) {
            if (onboarded) {
                return '/(tabs)';
            }
            return '/onboarding';
        }

        return '/auth/register';
    } catch (error) {
        console.error('Error checking auth state:', error);
        return '/auth/register'; // Default fallback
    }
};

export default function Index() {
    useEffect(() => {
        checkAuthState().then((route) => {
            router.replace(route as any);
        });
    }, []);

    return (
        <View className="flex-1 items-center justify-center bg-background">
            <View className="items-center">
                <Image 
                    source={require('../assets/images/icon.png')}
                    className="w-32 h-32 mb-4"
                    resizeMode="contain"
                />
                <Text className="text-primary text-2xl font-bold tracking-widest font-jb-bold">
                    GET THINGS DONE
                </Text>
            </View>
        </View>
    );
}
