import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { CATEGORIES, HABITS } from '@/constants/mockData';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ManageHabitScreen() {
    const { id, categoryId } = useLocalSearchParams();
    const isEditing = !!id;

    const existingHabit = useMemo(() => {
        if (!id) return null;
        return HABITS.find(h => h.id === id);
    }, [id]);

    const [name, setName] = useState(existingHabit?.title || '');
    const [selectedCategory, setSelectedCategory] = useState(existingHabit?.category_id || (typeof categoryId === 'string' ? categoryId : CATEGORIES[0].id));

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        if (isEditing && existingHabit) {
            // Update existing
            existingHabit.title = name;
            existingHabit.category_id = selectedCategory;
            existingHabit.updated_at = new Date().toISOString();
        } else {
            // Create new
            const newHabit = {
                id: `h_${Date.now()}`,
                user_id: 'u1', // Mock user
                category_id: selectedCategory,
                title: name,
                frequency_json: { type: 'daily' }, // Default
                streak: 0,
                updated_at: new Date().toISOString(),
            };
            HABITS.push(newHabit);
        }

        router.back();
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            'Are you sure you want to delete this habit?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive', 
                    onPress: () => {
                        if (existingHabit) {
                            // Soft delete logic matching existing mock data handling
                            // @ts-ignore
                            existingHabit.deleted_at = new Date().toISOString();
                            // If we needed hard delete:
                            // const index = HABITS.findIndex(h => h.id === id);
                            // if (index > -1) HABITS.splice(index, 1);
                        }
                        // Navigate back twice (to list) or just back? 
                        // If we are coming from Detail > Edit > Delete, we probably want to go back to List.
                        // router.dismissAll() might do too much.
                        // Let's try navigating to the habits tab directly or go back twice.
                        router.navigate('/(tabs)/habits');
                    }
                }
            ]
        );
    };

    return (
        <ScreenWrapper bg="bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-[#333333]">
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-white font-bold font-jb-bold uppercase tracking-widest text-sm">CANCEL</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold tracking-widest uppercase font-jb-bold">
                    {isEditing ? 'EDIT HABIT' : 'CREATE HABIT'}
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-[#39FF14] font-bold font-jb-bold uppercase tracking-widest text-sm">SAVE</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
                {/* Name */}
                <View className="mb-8">
                    <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">NAME</Text>
                    <View className="border border-[#333333] p-4 bg-black">
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Run 5km"
                            placeholderTextColor="#666666"
                            className="text-white font-mono text-base p-0"
                            autoFocus={!isEditing}
                        />
                    </View>
                </View>

                {/* Category */}
                <View className="mb-8">
                    <Text className="text-[#666666] font-bold font-jb-bold text-xs uppercase mb-3 tracking-widest">CATEGORY</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {CATEGORIES.map(cat => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-3 border ${
                                        isSelected ? 'border-white' : 'border-[#333333]'
                                    }`}
                                    style={{
                                        backgroundColor: isSelected ? cat.color : 'transparent'
                                    }}
                                >
                                    <Text 
                                        className={`font-bold font-jb-bold text-xs uppercase tracking-wider ${
                                            isSelected ? 'text-black' : 'text-white'
                                        }`}
                                    >
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Save Button (Big) */}
                <View className="mt-8">
                    <Button 
                        label={isEditing ? 'UPDATE HABIT' : 'SAVE HABIT'} 
                        onPress={handleSave}
                    />
                </View>

                {/* Delete Button (Only Edit) */}
                {isEditing && (
                    <View className="mt-6 items-center">
                        <TouchableOpacity onPress={handleDelete}>
                            <Text className="text-[#666] font-bold font-jb-bold uppercase tracking-widest text-sm">
                                DELETE HABIT
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </ScreenWrapper>
    );
}
