import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

import { authService } from '@/services/auth.service';

const checkAuthState = async () => {
    try {
        // Check if onboarding is complete
        const onboarded = await SecureStore.getItemAsync('hasOnboarded');
        const token = await authService.getToken();

        // Simulate a small delay for splash effect
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!onboarded) {
            return '/onboarding';
        }
        
        if (token) {
            return '/(tabs)';
        }

        return '/auth/register';
    } catch (error) {
        console.error('Error checking auth state:', error);
        return '/onboarding'; // Default fallback
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
                 {/* Replace with actual Logo Image if available */}
                <Image 
                    source={require('../assets/images/icon.png')}
                    className="w-32 h-32 mb-4"
                    resizeMode="contain"
                />
                <Text className="text-primary text-2xl font-bold tracking-widest font-jb-bold">
                    GTD MOBILE
                </Text>
            </View>
        </View>
    );
}
