import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';

// Mock function to check auth state - replace with actual logic later
const checkAuthState = async () => {
    try {
        // SIMULATING LOGOUT for testing purposes
        await SecureStore.deleteItemAsync('hasOnboarded');
        await SecureStore.deleteItemAsync('auth_token');

        // Check if onboarding is complete
        const onboarded = await SecureStore.getItemAsync('hasOnboarded');
        const token = await SecureStore.getItemAsync('auth_token');

        // Simulate a small delay for splash effect
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (!onboarded) {
            return '/onboarding';
        }
        
        if (!token) {
            return '/auth/register';
        }

        return '/(tabs)';
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
