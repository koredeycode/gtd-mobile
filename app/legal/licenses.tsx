import { ScreenWrapper } from '@/components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const LICENSES = [
    {
        name: 'React Native',
        copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.',
        license: 'MIT License.'
    },
    {
        name: 'Tailwind CSS',
        copyright: 'Copyright (c) Tailwind Labs, Inc.',
        license: 'MIT License.'
    },
    {
        name: 'Expo',
        copyright: 'Copyright (c) 2015-present 650 Industries, Inc. (aka Expo).',
        license: 'MIT License.'
    },
    {
        name: 'React Navigation',
        copyright: 'Copyright (c) 2017 React Navigation Contributors.',
        license: 'MIT License.'
    },
    {
        name: 'Jest',
        copyright: 'Copyright (c) OpenJS Foundation and other contributors.',
        license: 'MIT License.'
    },
    {
        name: 'TypeScript',
        copyright: 'Copyright (c) Microsoft Corporation. All rights reserved.',
        license: 'Apache License 2.0.'
    },
    {
        name: 'Axios',
        copyright: 'Copyright (c) 2014-present Matt Zabriskie.',
        license: 'MIT License.'
    },
    {
        name: 'Date-fns',
        copyright: 'Copyright (c) 2022 Sasha Koss and Lesha Koss.',
        license: 'MIT License.'
    },
    {
        name: 'Lodash',
        copyright: 'Copyright (c) OpenJS Foundation and other contributors.',
        license: 'MIT License.'
    },
];

export default function LicensesScreen() {
    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    OPEN SOURCE
                </Text>
                <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                <View className="gap-8">
                    {LICENSES.map((item, index) => (
                        <View key={index}>
                            <Text className="text-[#39FF14] font-jb-bold text-base mb-1 uppercase bg-black tracking-wider">
                                {item.name}
                            </Text>
                            <Text className="text-[#888888] font-mono text-xs mb-1">
                                {item.copyright}
                            </Text>
                            <Text className="text-[#888888] font-mono text-xs">
                                {item.license}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
