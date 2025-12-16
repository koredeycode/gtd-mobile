import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistSwitch } from '@/components/ui/BrutalistSwitch';
import { syncService } from '@/services';
import { UserProfile, userService } from '@/services/user.service';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

export default function SettingsScreen() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSyncModalVisible, setSyncModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

    useFocusEffect(
        useCallback(() => {
            loadUserProfile();
        }, [])
    );

    const loadUserProfile = async () => {
        try {
            const profile = await userService.getProfile();
            setUserProfile(profile);
        } catch (error) {
            console.log('Error loading profile:', error);
        }
    };

    const performSync = async () => {
        setSyncStatus('syncing');
        try {
            // Push changes first
            await syncService.pushChanges();
            // Then pull latest data
            await syncService.syncUserData();
            
            setSyncStatus('success');
            setTimeout(() => {
                setSyncModalVisible(false);
                setSyncStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Sync failed:', error);
            setSyncStatus('error');
        }
    };

    const toggleSyncModal = () => {
        if (!isSyncModalVisible) {
             setSyncModalVisible(true);
             performSync();
        } else {
             setSyncModalVisible(false);
             setSyncStatus('idle'); // Reset on close
        }
    };

    const toggleDeleteModal = () => setDeleteModalVisible(!isDeleteModalVisible);

    type SettingItem = 
        | { id: string; type: 'custom'; component: React.ReactNode; icon?: never; label?: never; danger?: never; color?: never }
        | { id: string; type: 'link' | 'toggle'; icon: string; label: string; danger?: boolean; color?: string; component?: never };

    type Section = {
        title: string;
        data: SettingItem[];
    };

    const SECTIONS: Section[] = [
        {
            title: 'ACCOUNT',
            data: [
                { id: 'profile', icon: 'person', label: 'Profile', type: 'link' },
            ]
        },
        {
            title: 'GENERAL',
            data: [
                { id: 'notifications', icon: 'notifications', label: 'Notification Preferences', type: 'link' },
                { id: 'dark_mode', icon: 'dark-mode', label: 'Dark Mode', type: 'toggle' },
            ]
        },
        {
            title: 'DATA',
            data: [
                { id: 'sync', icon: 'sync', label: 'Sync Data', type: 'link', color: '#39FF14' },
                { id: 'export', icon: 'file-download', label: 'Export Data', type: 'link' },
                { id: 'delete_account', icon: 'delete', label: 'Delete Account', type: 'link', danger: true },
            ]
        },
        {
            title: 'SUPPORT',
            data: [
                { id: 'about', icon: 'info', label: 'About GSD', type: 'link' },
                { id: 'help', icon: 'help', label: 'Help & FAQ', type: 'link' },
                { id: 'feedback', icon: 'feedback', label: 'Send Feedback', type: 'link' },
            ]
        },
        {
            title: 'DEBUG',
            data: [
                { id: 'widget_preview', icon: 'widgets', label: 'Widget Preview', type: 'link', color: '#FFD700' },
            ]
        }
    ];

    return (
        <ScreenWrapper bg="bg-black">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold font-jb-bold tracking-widest uppercase">
                    Settings
                </Text>
                <View className="w-6" />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {SECTIONS.map((section, sectionIndex) => (
                    <View key={section.title} className="mb-8 mt-6">
                        <Text className="text-[#666] font-bold font-jb-bold px-6 mb-4 text-xs tracking-widest">
                            {section.title}
                        </Text>
                        <View className="bg-black mx-4 border border-[#333333]">
                            {section.data.map((item, itemIndex) => {
                                if (item.type === 'custom') {
                                    return (
                                        <View key={item.id}>
                                            {item.component}
                                        </View>
                                    );
                                }

                                return (
                                <TouchableOpacity 
                                    key={item.id}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (item.type === 'toggle') return;
                                        
                                        if (item.id === 'profile') {
                                            router.push('/profile');
                                        } else if (item.id === 'notifications') {
                                            router.push('/notifications');
                                        } else if (item.id === 'help') {
                                            router.push('/help');
                                        } else if (item.id === 'about') {
                                            router.push('/about');
                                        } else if (item.id === 'feedback') {
                                            router.push('/feedback');
                                        } else if (item.id === 'export') {
                                            router.push('/data/export');
                                        } else if (item.id === 'sync') {
                                            toggleSyncModal();
                                        } else if (item.id === 'delete_account') {
                                            toggleDeleteModal();
                                        } else if (item.id === 'widget_preview') {
                                            router.push('/debug/widget-preview' as any);
                                        }
                                    }}
                                    className={`flex-row items-center justify-between p-4 bg-black ${
                                        itemIndex !== section.data.length - 1 ? 'border-b border-[#333333]' : ''
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <MaterialIcons 
                                            name={item.icon as any} 
                                            size={24} 
                                            color={item.color || (item.danger ? '#FF3B30' : 'white')} 
                                        />
                                        <Text 
                                            className="ml-4 text-base font-normal font-mono"
                                            style={{ color: item.color || (item.danger ? '#FF3B30' : 'white') }}
                                        >
                                            {item.label}
                                        </Text>
                                    </View>
                                    
                                    {item.type === 'toggle' ? (
                                        <BrutalistSwitch
                                            value={isDarkMode}
                                            onValueChange={setIsDarkMode}
                                        />
                                    ) : (
                                        <MaterialIcons name="chevron-right" size={24} color="#666666" />
                                    )}
                                </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Sync Data Modal */}
            <Modal
                isVisible={isSyncModalVisible}
                onBackdropPress={toggleSyncModal}
                backdropOpacity={0.8}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
            >
                <View className={`bg-black border-2 p-8 items-center ${syncStatus === 'error' ? 'border-red-500' : 'border-[#39FF14]'}`}>
                    
                    {syncStatus === 'syncing' && (
                        <View className="mb-6 animate-spin">
                            <MaterialIcons name="sync" size={64} color="#39FF14" />
                        </View>
                    )}

                    {syncStatus === 'success' && (
                        <View className="mb-6">
                            <MaterialIcons name="check-circle" size={64} color="#39FF14" />
                        </View>
                    )}

                    {syncStatus === 'error' && (
                        <View className="mb-6">
                            <MaterialIcons name="error" size={64} color="#EF4444" />
                        </View>
                    )}
                    
                    <Text className={`text-xl font-bold font-jb-bold uppercase tracking-widest mb-4 ${syncStatus === 'error' ? 'text-red-500' : 'text-[#39FF14]'}`}>
                        {syncStatus === 'syncing' ? 'SYNCING DATA...' : 
                         syncStatus === 'success' ? 'SYNC COMPLETE' : 
                         syncStatus === 'error' ? 'SYNC FAILED' : 'READY TO SYNC'}
                    </Text>
                    
                    <Text className="text-white text-center font-mono text-sm leading-6 mb-8">
                        {syncStatus === 'syncing' ? 'Please wait. Your data is being securely synced with the GSD cloud.' :
                         syncStatus === 'success' ? 'Your local changes have been pushed to the cloud.' :
                         syncStatus === 'error' ? 'There was an issue syncing your data. Please try again.' : ''}
                    </Text>

                    <TouchableOpacity 
                        className="w-full border border-white py-4 items-center active:bg-[#333333]"
                        onPress={toggleSyncModal}
                    >
                        <Text className="text-white font-bold font-jb-bold uppercase tracking-widest">
                            {syncStatus === 'syncing' ? 'CANCEL' : 'CLOSE'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isVisible={isDeleteModalVisible}
                onBackdropPress={toggleDeleteModal}
                backdropOpacity={0.8}
                animationIn="fadeIn"
                animationOut="fadeOut"
                useNativeDriver
            >
                <View className="bg-black border border-[#333333]">
                    <View className="p-8 items-center">
                        <View className="mb-6">
                            <FontAwesome name="warning" size={48} color="#FF6B00" />
                        </View>
                        
                        <Text className="text-white text-xl font-bold font-jb-bold uppercase tracking-widest mb-4">
                            DELETE ACCOUNT
                        </Text>
                        
                        <Text className="text-white text-center font-mono text-sm leading-6 mb-6">
                            This action is irreversible. All your data will be permanently deleted. Are you sure you want to proceed?
                        </Text>

                        <View className="w-full mb-2">
                            <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-2 tracking-widest">
                                PASSWORD CONFIRMATION
                            </Text>
                            <TextInput 
                                className="w-full border border-[#666666] text-white p-3 font-mono"
                                placeholder="Enter your password"
                                placeholderTextColor="#444444"
                                secureTextEntry
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                            />
                        </View>
                    </View>

                    <View className="flex-row border-t border-[#333333]">
                        <TouchableOpacity 
                            className="flex-1 py-4 items-center bg-black active:bg-[#111111]"
                            onPress={toggleDeleteModal}
                        >
                            <Text className="text-white font-bold font-jb-bold uppercase tracking-widest">
                                CANCEL
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            className="flex-1 py-4 items-center bg-[#FF6B00] active:opacity-90"
                            onPress={() => {
                                // Handle delete logic
                                toggleDeleteModal();
                            }}
                        >
                            <Text className="text-black font-bold font-jb-bold uppercase tracking-widest">
                                DELETE
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
}
