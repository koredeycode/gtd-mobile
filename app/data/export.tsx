import { ScreenWrapper } from '@/components/ScreenWrapper';
import { BrutalistSwitch } from '@/components/ui/BrutalistSwitch';
import { Button } from '@/components/ui/Button';
import { userService } from '@/services/user.service';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExportDataScreen() {
    // Mock State
    const [includeHabits, setIncludeHabits] = useState(true);
    const [includeNotes, setIncludeNotes] = useState(false);
    const [includeTags, setIncludeTags] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        loadUserEmail();
    }, []);

    const loadUserEmail = async () => {
        try {
            const profile = await userService.getProfile();
            setUserEmail(profile.email);
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            Alert.alert('Export Complete', `Your data has been exported successfully to ${userEmail}`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
             <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                   <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    EXPORT DATA
                </Text>
                 <View className="w-6" /> 
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                
                {/* Format */}
                <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">FORMAT</Text>
                <TouchableOpacity className="flex-row items-center justify-between border border-[#333333] p-4 mb-8 bg-black">
                    <Text className="text-white font-mono text-base">CSV</Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="white" />
                </TouchableOpacity>

                {/* Date Range */}
                <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">DATE RANGE</Text>
                <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity className="flex-1 flex-row items-center justify-between border border-[#333333] p-4 bg-black">
                        <Text className="text-white font-mono text-base">2023-01-01</Text>
                        <MaterialIcons name="calendar-today" size={20} color="#666666" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 flex-row items-center justify-between border border-[#333333] p-4 bg-black">
                        <Text className="text-white font-mono text-base">2023-12-31</Text>
                        <MaterialIcons name="calendar-today" size={20} color="#666666" />
                    </TouchableOpacity>
                </View>

                {/* Destination */}
                <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">DESTINATION</Text>
                <TouchableOpacity className="flex-row items-center justify-between border border-[#333333] p-4 mb-8 bg-black">
                    <Text className="text-white font-mono text-base truncate" numberOfLines={1}>
                        {userEmail ? `Email to ${userEmail}` : 'Loading...'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="white" />
                </TouchableOpacity>

                {/* Include Options */}
                <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">INCLUDE</Text>
                <View className="border border-[#333333] mb-12">
                     {/* <View className="flex-row items-center justify-between p-4 border-b border-[#333333] bg-black">
                        <Text className="text-white font-mono text-base">Habit Data</Text>
                        <BrutalistSwitch value={includeHabits} onValueChange={setIncludeHabits} />
                    </View> */}
                    <View className="flex-row items-center justify-between p-4 border-b border-[#333333] bg-black">
                        <Text className="text-white font-mono text-base">Notes & Journals</Text>
                        <BrutalistSwitch value={includeNotes} onValueChange={setIncludeNotes} />
                    </View>
                    {/* <View className="flex-row items-center justify-between p-4 bg-black">
                        <Text className="text-white font-mono text-base">Tags & Categories</Text>
                        <BrutalistSwitch value={includeTags} onValueChange={setIncludeTags} />
                    </View> */}
                </View>

                {/* Export Button */}
                <Button 
                    label={exporting ? 'EXPORTING...' : 'EXPORT'} 
                    onPress={handleExport}
                    disabled={exporting}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}
