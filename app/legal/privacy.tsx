import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyScreen() {
    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    PRIVACY POLICY
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <Text className="text-[#666666] font-mono text-xs mb-8">Last Updated: October 26, 2023</Text>
                
                <View className="gap-6">
                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">1. Information We Collect</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            We do not collect any personally identifiable information from you. GSD is designed to store all your data locally on your device. We have no access to your tasks, habits, or any other data you input into the app.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">2. How We Use Your Information</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            Since we do not collect any personal information, we do not use it for any purpose. All data you create remains on your device under your control.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">3. Data Storage</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            All data entered into the GSD app is stored exclusively on your local device. We do not use any cloud services to store your personal data. If you delete the app, all associated data will be removed from your device.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">4. Third-Party Services</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            GSD does not integrate with any third-party services that would have access to your data. We do not use analytics, advertising platforms, or social media integrations.
                        </Text>
                    </View>

                     <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">5. Your Rights</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            You have complete control over your data. You can add, edit, and delete your data at any time within the app. Since we don't collect your data, there's no need to request data deletion from us.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">6. Changes to this Policy</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                           We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                        </Text>
                    </View>
                    
                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">7. Contact Us</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                           If you have any questions about this Privacy Policy, you can contact us at: support@gsd-industries.dev
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
