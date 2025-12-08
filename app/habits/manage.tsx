import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { Category } from '@/db/types';
import { authService } from '@/services';
import { CategoryService } from '@/services/CategoryService';
import { HabitService } from '@/services/HabitService';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ManageHabitScreen() {
    const { id, categoryId } = useLocalSearchParams();
    const isEditing = !!id;
    const [categories, setCategories] = useState<Category[]>([]);
    
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await CategoryService.getAllCategories();
            setCategories(cats);
            
            // If we have a categoryId param, use it. 
            // If not, and no selection yet, default to first.
            // BUT, if we are editing (id exists), DO NOT default to first, wait for habit load.
            if (categoryId && typeof categoryId === 'string') {
                setSelectedCategory(categoryId);
            } else if (!selectedCategory && cats.length > 0 && !isEditing) {
                 setSelectedCategory(cats[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [existingHabit, setExistingHabit] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadHabit(id as string);
        }
    }, [id]);

    const loadHabit = async (habitId: string) => {
        try {
            const db = await require('@/db').getDB();
            const habit = await db.getFirstAsync('SELECT * FROM habits WHERE id = ?', [habitId]);
            if (habit) {
                setExistingHabit(habit);
                setName(habit.title);
                // Ensure we respect the existing habit's category
                setSelectedCategory(habit.category_id);
            }
        } catch (e) {
            console.error('Failed to load habit', e);
        }
    };

    // Update selection if categoryId param changes (and we aren't editing an existing one yet)
    useEffect(() => {
        if (typeof categoryId === 'string' && !isEditing) {
            setSelectedCategory(categoryId);
        }
    }, [categoryId, isEditing]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        try {
             // ... existing save logic ...
            if (isEditing) {
                 // Implement Update
                 const db = await require('@/db').getDB();
                 const now = Date.now();
                 await db.runAsync(
                     'UPDATE habits SET title = ?, category_id = ?, updated_at = ?, sync_status = CASE WHEN sync_status = "created" THEN "created" ELSE "updated" END WHERE id = ?',
                     [name, selectedCategory, now, id]
                 );
            } else {
                const userId = await authService.getUserId();
                if (!userId) {
                    Alert.alert('Error', 'User login required');
                    return;
                }

                await HabitService.createHabit({
                    category_id: selectedCategory || (categories[0]?.id),
                    title: name,
                    frequency: JSON.stringify({ type: 'daily' }),
                    type: 'build',
                    description: null,
                    goal_id: null
                });
            }
            router.back();
        } catch (error) {
             console.error(error);
             Alert.alert('Error', 'Failed to save habit');
        }
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
                    onPress: async () => {
                        try {
                             if (id) {
                                 const db = await require('@/db').getDB();
                                 const now = Date.now();
                                 // Soft delete
                                 await db.runAsync(
                                     'UPDATE habits SET is_archived = 1, updated_at = ?, sync_status = CASE WHEN sync_status = "created" THEN "created" ELSE "updated" END WHERE id = ?',
                                     [now, id]
                                 );
                             }
                             router.navigate('/(tabs)/habits');
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'Failed to delete');
                        }
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
                        {categories.map(cat => {
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
