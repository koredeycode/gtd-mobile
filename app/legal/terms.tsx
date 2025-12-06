import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TermsScreen() {
    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    TERMS OF SERVICE
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <Text className="text-[#666666] font-mono text-xs mb-8">LAST UPDATED: 21 OCTOBER 2024</Text>
                
                <Text className="text-[#888888] font-mono text-sm leading-6 mb-8">
                    Welcome to GSD ("Get Things Done"). These Terms of Service ("Terms") govern your use of our mobile application (the "Service"). By accessing or using the Service, you agree to be bound by these Terms.
                </Text>

                <View className="gap-6">
                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">1. Use of Service</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            GSD is a tool designed to help you track habits and be productive. You agree to use the Service only for its intended purposes and in compliance with all applicable laws. You are responsible for any content you create within the app.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">2. User Accounts</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            Account creation is not required for core functionality. If you create an account, you are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">3. Prohibited Conduct</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            You agree not to use the Service to: (a) engage in any illegal activity; (b) harass, abuse, or harm another person; (c) violate the intellectual property rights of others; or (d) interfere with the operation of the Service.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">4. Disclaimers</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            The Service is provided "as is" and "as available" without any warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. Your use of the Service is at your own risk.
                        </Text>
                    </View>

                     <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">5. Limitation of Liability</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                            To the fullest extent permitted by law, GSD Industries shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
                        </Text>
                    </View>

                    <View>
                        <Text className="text-[#39FF14] font-jb-bold text-base mb-2 uppercase">6. Changes to Terms</Text>
                        <Text className="text-[#888888] font-mono text-sm leading-6">
                           We reserve the right to modify these Terms at any time. We will provide notice of any material changes. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
