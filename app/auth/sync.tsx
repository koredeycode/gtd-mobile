import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { syncService } from '@/services/sync.service';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function SyncScreen() {
    const [status, setStatus] = useState<string>('Initializing...');
    const [progress, setProgress] = useState(0);
    const [hasData, setHasData] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startSync();
    }, []);

    const startSync = async () => {
        try {
            setError(null);
            
            // Step 1: Sync Categories
            setStatus('Syncing categories...');
            setProgress(0.3);
            await syncService.syncCategories();
            
            // Step 2: Sync User Data
            setStatus('Syncing your habits and logs...');
            setProgress(0.6);
            const result = await syncService.syncUserData();
            
            setStatus(result.hasData ? 'Data synced' : 'Sync complete');
            setProgress(1.0);
            setHasData(result.hasData);

        } catch (err) {
            console.error('Sync failed:', err);
            setError('Failed to sync data. Please try again.');
            setStatus('Sync failed');
        }
    };

    const handleContinue = async () => {
        if (hasData) {
            await SecureStore.setItemAsync('hasOnboarded', 'true');
            router.replace('/(tabs)');
        } else {
            router.replace('/onboarding');
        }
    };

    return (
        <ScreenWrapper bg="bg-black">
            <View className="flex-1 items-center justify-center px-6">
                <View className="mb-8 items-center">
                    <Text className="text-[#39FF14] text-2xl font-bold font-display uppercase tracking-widest mb-4 text-center">
                        SYNCING DATA
                    </Text>
                    
                    {!error && hasData === null && (
                        <ActivityIndicator size="large" color="#39FF14" className="mb-6" />
                    )}

                    <Text className="text-white font-mono text-sm text-center mb-8">
                        {status}
                    </Text>

                    {/* Simple Progress Bar */}
                    {!error && hasData === null && (
                        <View className="w-64 h-2 bg-[#333] rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-[#39FF14]" 
                                style={{ width: `${progress * 100}%` }} 
                            />
                        </View>
                    )}
                </View>

                {error && (
                    <Button 
                        label="RETRY SYNC" 
                        onPress={startSync}
                        className="mb-4 w-full"
                    />
                )}

                {hasData !== null && (
                    <View className="w-full">
                        <Text className="text-[#888] font-mono text-xs text-center mb-6">
                            {hasData ? 'Data found. Ready to continue.' : 'No existing data found. Starting fresh.'}
                        </Text>
                        <Button 
                            label={hasData ? "GO TO DASHBOARD" : "START ONBOARDING"} 
                            onPress={handleContinue}
                            className="w-full"
                        />
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
}
