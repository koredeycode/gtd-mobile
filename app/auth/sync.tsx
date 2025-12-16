import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { clearDatabase } from '@/db';
import { syncService } from '@/services/sync.service';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

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
            setProgress(0.2);
            await syncService.syncCategories();
            
            // Step 2: Push any local changes (e.g. if re-installing or clearing data but some local state persists)
            // It's good practice to ensure we push before pulling
            setStatus('Pushing local changes...');
            setProgress(0.4);
            await syncService.pushChanges();

            // Step 3: Sync User Data (Pull)
            setStatus('Syncing your habits and logs...');
            setProgress(0.7);
            const result = await syncService.syncUserData();
            
            setStatus(result.hasData ? 'Data synced' : 'Sync complete');
            setProgress(1.0);
            setHasData(result.hasData);

        } catch (err: any) {
            console.error('Sync failed:', err);
            if (err.stack) {
                console.error('Stack trace:', err.stack);
            }
            const errorMessage = err instanceof Error ? err.message : String(err);
            const stackTrace = err instanceof Error && err.stack ? `\n\n${err.stack}` : '';
            // Generic stringify that handles Error objects and other objects
            const fullError = JSON.stringify(err, Object.getOwnPropertyNames(err), 2);
            
            Alert.alert('Sync Error', errorMessage + stackTrace + "\n\nFull Detail:\n" + fullError);
            setError(`Failed to sync data: ${errorMessage}`);
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
                
                {error && (
                    <Button 
                        label="RESET DATABASE (FIX SCHEMA)" 
                        onPress={async () => {
                            try {
                                setStatus('Resetting database...');
                                await clearDatabase();
                                setStatus('Database reset. Retrying sync...');
                                setTimeout(startSync, 1000);
                            } catch (e) {
                                Alert.alert('Reset Failed', String(e));
                            }
                        }}
                        className="mb-4 w-full bg-red-500"
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
