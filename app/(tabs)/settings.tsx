import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistSwitch } from '@/components/ui/BrutalistSwitch';
import { UserProfile, userService } from '@/services/user.service';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

export default function SettingsScreen() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isSyncModalVisible, setSyncModalVisible] = useState(false);
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

    const toggleSyncModal = () => setSyncModalVisible(!isSyncModalVisible);
    const toggleDeleteModal = () => setDeleteModalVisible(!isDeleteModalVisible);

    const SECTIONS = [
        {
            title: 'ACCOUNT',
            data: [
                // Custom item structure for Profile Card
                { 
                    id: 'profile_card', 
                    type: 'custom',
                    component: (
                        <TouchableOpacity 
                            onPress={() => router.push('/profile')}
                            className="flex-row items-center p-4 bg-black"
                        >
                            <View className="h-16 w-16 rounded-full bg-[#222] items-center justify-center border border-[#333] mr-4">
                                <Text className="text-white text-2xl font-bold font-jb-bold">
                                    {userProfile?.firstName?.[0] || userProfile?.email?.[0] || '?'}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-white text-lg font-bold font-jb-bold mb-1">
                                    {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Guest User'}
                                </Text>
                                <Text className="text-[#888] text-sm font-mono">
                                    {userProfile?.email || 'Not logged in'}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    )
                },
                { id: 'profile', icon: 'person', label: 'Edit Profile', type: 'link' },
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
                { id: 'sync', icon: 'sync', label: 'Sync Data', type: 'link' },
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
        }
    ];

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    SETTINGS
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {SECTIONS.map((section, index) => (
                    <View key={index} className="mt-8">
                        <Text className="px-6 text-[#666666] font-bold font-jb-bold text-xs uppercase mb-4 tracking-widest">
                            {section.title}
                        </Text>
                        
                        <View className="border border-[#333333] mx-6">
                            {section.data.map((item: any, itemIndex) => {
                                if (item.type === 'custom') {
                                    return (
                                        <View key={item.id} className={itemIndex !== section.data.length - 1 ? 'border-b border-[#333333]' : ''}>
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
                                        }
                                    }}
                                    className={`flex-row items-center justify-between p-4 bg-black ${
                                        itemIndex !== section.data.length - 1 ? 'border-b border-[#333333]' : ''
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <MaterialIcons 
                                            name={item.icon} 
                                            size={24} 
                                            color={item.danger ? '#FF3B30' : '#666666'} 
                                        />
                                        <Text className={`ml-4 text-base font-normal font-mono ${
                                            item.danger ? 'text-[#FF3B30]' : 'text-white'
                                        }`}>
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
                <View className="bg-black border-2 border-[#39FF14] p-8 items-center">
                    <View className="mb-6 animate-spin">
                        <MaterialIcons name="sync" size={64} color="#39FF14" />
                    </View>
                    
                    <Text className="text-[#39FF14] text-xl font-bold font-jb-bold uppercase tracking-widest mb-4">
                        SYNCING DATA...
                    </Text>
                    
                    <Text className="text-white text-center font-mono text-sm leading-6 mb-8">
                        Please wait. Your data is being securely synced with the GSD cloud.
                    </Text>

                    <TouchableOpacity 
                        className="w-full border border-white py-4 items-center active:bg-[#333333]"
                        onPress={toggleSyncModal}
                    >
                        <Text className="text-white font-bold font-jb-bold uppercase tracking-widest">
                            CANCEL SYNC
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
