import { RESET_TIMES } from '@/components/onboarding/constants';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CategoryService } from '@/services/CategoryService';
import { HabitService } from '@/services/HabitService';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Category as ApiCategory, categoryService, habitService } from '../../services';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [resetTime, setResetTime] = useState('midnight');

  // Categories State
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Step 2 & 3 State
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHabits, setGeneratedHabits] = useState<any[]>([]);

  // Step 3 State
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // 1. Fetch from API
      const data = await categoryService.getCategories();
      setCategories(data);

      // 2. Sync to Local SQLite DB
      try {
        const localCats = await CategoryService.getAllCategories();
        const existingIds = new Set(localCats.map(c => c.id));
        const newCats = data.filter(c => !existingIds.has(c.id));

        if (newCats.length > 0) {
            for (const cat of newCats) {
                await CategoryService.createCategory({
                    id: cat.id,
                    name: cat.name,
                    color: cat.color,
                    icon: 'label' 
                });
            }
            console.log(`Saved ${newCats.length} categories to Local DB`);
        } else {
            console.log('Categories already up to date in Local DB');
        }
      } catch (dbError) {
          console.error('Failed to sync categories to local DB:', dbError);
          // Don't block onboarding if local DB fails, but log it
      }
      
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please check your connection.');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    try {
      // Save preferences
      await SecureStore.setItemAsync('hasOnboarded', 'true');
      await SecureStore.setItemAsync('userCategories', JSON.stringify(selectedCategories));
      await SecureStore.setItemAsync('resetTime', resetTime);
      
      // Save generated habits if any (Mock implementation)
      if (generatedHabits.length > 0) {
          await SecureStore.setItemAsync('initialHabits', JSON.stringify(generatedHabits));
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : prev);

  const generateHabits = async () => {
      if (!goalInput.trim() && selectedCategories.length === 0) return;
      
      setIsGenerating(true);
      try {
          const response = await habitService.generateHabits({
              goal: goalInput,
              categories: selectedCategories,
          });

          // Flatten response to match local state structure
          // Response: { categories: [ { name: 'Health', habits: [{ title: '...' }] } ] }
          // Local State: [ { id: '...', title: '...', category: '...' } ]
          
          const habits: any[] = [];
          
          response.categories.forEach((cat: any) => {
              cat.habits.forEach((habit: any, index: number) => {
                  habits.push({
                      id: `${cat.name}-${index}-${Date.now()}`, // Generate unique ID
                      title: habit.title,
                      category: cat.name.toUpperCase(),
                  });
              });
          });

          setGeneratedHabits(habits);
          setStep(3);
      } catch (error) {
          Alert.alert('Generation Failed', (error as Error).message);
      } finally {
          setIsGenerating(false);
      }
  };

  const removeHabit = (id: string) => {
      setGeneratedHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveHabits = async () => {
      console.log('--- Starting handleSaveHabits ---');
      setIsSaving(true);
      try {
          // Map generated habits to payload format
          // Need to find categoryId for each category name
          // Group habits by category first to match payload structure
          console.log('Grouping habits:', generatedHabits);
          console.log('Available categories:', JSON.stringify(categories, null, 2));
          const grouped = generatedHabits.reduce((acc, habit) => {
              if (!acc[habit.category]) acc[habit.category] = [];
              acc[habit.category].push(habit);
              return acc;
          }, {} as Record<string, any[]>);

          const payloadCategories: { categoryId: string; habits: string[] }[] = [];

          // Helper for fuzzy category matching
          const findCategory = (catName: string) => {
              const normalizedInput = catName.toUpperCase();
              
              // 1. Try exact match
              let match = categories.find(c => c.name.toUpperCase() === normalizedInput);
              if (match) return match;

              // 2. Keyword mapping
              if (normalizedInput.includes('PHYSICAL') || normalizedInput.includes('HEALTH') || normalizedInput.includes('FITNESS')) {
                  return categories.find(c => c.name === 'Health & Fitness');
              }
              if (normalizedInput.includes('WORK') || normalizedInput.includes('CAREER') || normalizedInput.includes('PROFESSIONAL')) {
                  return categories.find(c => c.name === 'Work & Career');
              }
              if (normalizedInput.includes('DEVELOPMENT') || normalizedInput.includes('LEARNING') || normalizedInput.includes('GROWTH')) {
                  return categories.find(c => c.name === 'Personal Development');
              }
              if (normalizedInput.includes('FINANCE') || normalizedInput.includes('MONEY') || normalizedInput.includes('BUDGET')) {
                  return categories.find(c => c.name === 'Finance');
              }
              if (normalizedInput.includes('SOCIAL') || normalizedInput.includes('RELATIONSHIP') || normalizedInput.includes('FAMILY')) {
                  return categories.find(c => c.name === 'Social & Relationships');
              }
              if (normalizedInput.includes('MINDFULNESS') || normalizedInput.includes('SPIRITUAL') || normalizedInput.includes('MENTAL') || normalizedInput.includes('EMOTIONAL')) {
                  return categories.find(c => c.name === 'Mindfulness & Spirituality') || categories.find(c => c.name === 'Health & Fitness');
              }
               if (normalizedInput.includes('HOBBIES') || normalizedInput.includes('CREATIVITY') || normalizedInput.includes('ART')) {
                  return categories.find(c => c.name === 'Hobbies & Creativity');
              }
              if (normalizedInput.includes('HOME') || normalizedInput.includes('ENVIRONMENT')) {
                  return categories.find(c => c.name === 'Home & Environment');
              }

              return undefined;
          };

          (Object.entries(grouped) as [string, any[]][]).forEach(([catName, habits]) => {
              const category = findCategory(catName);
              if (category) {
                  console.log(`Matched '${catName}' to '${category.name}'`);
                  payloadCategories.push({
                      categoryId: category.id,
                      habits: habits.map(h => h.title)
                  });
              } else {
                  console.warn(`Category not found and no fuzzy match for: ${catName}`);
              }
          });

          console.log('Payload constructed:', JSON.stringify(payloadCategories, null, 2));

          if (payloadCategories.length > 0) {
              console.log('Calling habitService.bulkCreateHabits...');
              const savedHabits = await habitService.bulkCreateHabits({ categories: payloadCategories });
              console.log('API Response (savedHabits):', JSON.stringify(savedHabits, null, 2));
              
              // Sync to Local DB
              console.log('Syncing to Local DB...');
              for (const habit of savedHabits) {
                  console.log(`Syncing habit: ${habit.title} (${habit.id})`);
                  // Default values for fields not returned by simple bulk create or map appropriately
                  await HabitService.createHabit({
                      id: habit.id,
                      category_id: habit.categoryId,
                      title: habit.title,
                      description: null,
                      frequency: habit.frequencyJson?.type || 'daily', 
                      type: 'good',
                      goal_id: null
                  });
              }
              console.log(`Synced ${savedHabits.length} habits to Local DB`);
          } else {
              console.warn('No payload categories created. Check category matching.');
          }
          
          nextStep();
      } catch (error) {
          console.error('Failed to save habits:', error);
          if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
          }
           // Log full error object if possible
          console.error('Full Error Object:', JSON.stringify(error, null, 2));

          Alert.alert('Error', 'Failed to save habits. Please try again.');
      } finally {
          setIsSaving(false);
          console.log('--- Finished handleSaveHabits ---');
      }
  };

  // --- Step 1: Categories ---
  const renderStep1 = () => (
    <View className="flex-1 w-full max-w-md mx-auto">
        <View className="items-center mb-8">
            <Text className="text-[#E0E0E0] text-3xl font-bold uppercase tracking-wider text-center font-display">
                Select Categories
            </Text>
            <Text className="text-[#E0E0E0] text-base font-normal pt-4 font-mono text-center">
                CHOOSE YOUR CORE FOCUS AREAS.
            </Text>
        </View>

        {isLoadingCategories ? (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#39FF14" />
            </View>
        ) : (
        <ScrollView className="flex-1 space-y-2 pr-2" showsVerticalScrollIndicator={false}>
            {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                // Default icon if not returned by API or map appropriately
                const iconName = 'label' as any; 

                return (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => toggleCategory(cat.id)}
                        className={cn(
                            "flex-row h-16 w-full items-center border p-4 mb-2",
                            isSelected ? "border-[#39FF14] bg-[#1E293B]" : "border-[#E0E0E0] bg-transparent"
                        )}
                    >
                        <MaterialIcons 
                            name={iconName} 
                            size={24} 
                            color={isSelected ? '#39FF14' : '#E0E0E0'} 
                            style={{ marginRight: 16 }}
                        />
                        <Text className="flex-1 text-base font-normal uppercase leading-normal text-[#E0E0E0] font-mono">
                            {cat.name}
                        </Text>
                        <View className={cn(
                            "h-6 w-6 flex items-center justify-center",
                            isSelected ? "bg-[#39FF14]" : "border-2 border-[#E0E0E0]"
                        )}>
                            {isSelected && <MaterialIcons name="check" size={18} color="black" />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
        )}

        <View className="mt-6">
             <Button label="Next Step" onPress={nextStep} />
        </View>
    </View>
  );

  // --- Step 2: Goal Input ---
  const renderStep2 = () => (
      <View className="flex-1 w-full max-w-md mx-auto">
          <View className="mb-8">
              <Text className="text-[#888888] text-base font-mono mb-4">
                  Describe your goals or what you want to achieve
              </Text>
              
              <View className="border border-white p-4 h-48">
                  <TextInput 
                      className="text-white text-base font-mono flex-1 text-start"
                      placeholder="e.g. get fit, learn a new skill, finish my side project..."
                      placeholderTextColor="#666"
                      multiline
                      textAlignVertical="top"
                      value={goalInput}
                      onChangeText={setGoalInput}
                  />
              </View>
          </View>

          <View className="mt-auto mb-6">
               <TouchableOpacity 
                  onPress={generateHabits}
                  disabled={isGenerating}
                  className="bg-[#39FF14] h-14 items-center justify-center active:opacity-90"
               >
                   {isGenerating ? (
                       <ActivityIndicator color="black" />
                   ) : (
                       <Text className="text-black font-bold uppercase tracking-widest font-mono">
                           GENERATE HABITS
                       </Text>
                   )}
               </TouchableOpacity>
          </View>
      </View>
  );

  // --- Step 3: Generated Habits ---
  const renderStep3 = () => {
      // Group habits by category
      const grouped = generatedHabits.reduce((acc, habit) => {
          if (!acc[habit.category]) acc[habit.category] = [];
          acc[habit.category].push(habit);
          return acc;
      }, {} as Record<string, any[]>);

      return (
        <View className="flex-1 w-full max-w-md mx-auto">
            <View className="items-center mb-8">
                <Text className="text-[#E0E0E0] text-lg font-bold uppercase tracking-wider text-center font-mono">
                    GENERATED HABITS
                </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {(Object.entries(grouped) as [string, any[]][]).map(([category, habits]) => (
                    <View key={category} className="mb-6">
                        <Text className="text-[#888888] text-xs font-bold uppercase tracking-widest mb-2 font-mono border-b border-[#333] pb-1">
                            {category}
                        </Text>
                        {habits.map((habit) => (
                            <View key={habit.id} className="flex-row items-center justify-between py-4 border-b border-[#222]">
                                <View>
                                    <Text className="text-white text-base font-bold font-mono mb-1">
                                        {habit.title}
                                    </Text>
                                    {/* <Text className="text-[#666] text-xs font-mono uppercase">
                                        {habit.category}
                                    </Text> */}
                                </View>
                                <View className="flex-row items-center gap-4">
                                    {/* <TouchableOpacity>
                                        <MaterialIcons name="add-box" size={24} color="white" />
                                    </TouchableOpacity> */}
                                    <TouchableOpacity onPress={() => removeHabit(habit.id)}>
                                        <MaterialIcons name="delete-outline" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <View className="mt-4 gap-3 bg-black py-4">
                 <Button 
                    label={isSaving ? "SAVING..." : "SAVE HABITS"} 
                    onPress={handleSaveHabits} 
                    disabled={isSaving}
                 />
            </View>
        </View>
      );
  };

  // --- Step 4: Preferences ---
  const renderStep4 = () => (
    <View className="flex-1 w-full max-w-md mx-auto">
        <View className="items-center mb-12">
            <Text className="text-[#E0E0E0] text-3xl font-bold uppercase tracking-wider text-center font-display">
                Final Preference
            </Text>
            <Text className="text-[#E0E0E0] text-base font-normal pt-4 font-mono text-center">
                CHOOSE YOUR DAILY RESET TIME
            </Text>
        </View>

        <View className="space-y-4">
            {RESET_TIMES.map((time) => {
                const isSelected = resetTime === time.id;
                return (
                    <TouchableOpacity
                        key={time.id}
                        onPress={() => setResetTime(time.id)}
                        className={cn(
                            "flex-row items-center space-x-4 border p-4 mb-4",
                             isSelected ? "border-[#39FF14]" : "border-[#E0E0E0]"
                        )}
                    >
                         <View className={cn(
                             "h-6 w-6 rounded-none border flex items-center justify-center mr-4",
                             isSelected ? "border-[#39FF14] bg-[#39FF14]" : "border-[#E0E0E0]"
                         )}>
                             {isSelected && <View className="h-3 w-3 bg-black" />}
                         </View>
                        <Text className="text-base font-normal leading-normal text-[#E0E0E0] font-mono">
                            {time.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>

        <View className="mt-auto mb-6">
             <Button label="Complete Setup" onPress={handleComplete} />
        </View>
    </View>
  );

  return (
    <ScreenWrapper bg="bg-black">
      <View className="flex-1 px-4 pt-8 pb-6">
          <View className="flex-row items-center justify-between w-full mb-8 relative">
              {step > 1 ? (
                  <TouchableOpacity onPress={prevStep} className="absolute left-0 z-10 p-2">
                       <MaterialIcons name="arrow-back-ios" size={24} color="white" />
                  </TouchableOpacity>
              ) : <View className="w-10" />}

              <View className="flex-1 items-center">
                  <Text className="text-center text-sm font-normal uppercase tracking-widest text-[#E0E0E0] font-mono">
                      STEP {step} OF 4
                  </Text>
              </View>
              <View className="w-10" />
          </View>
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
      </View>
    </ScreenWrapper>
  );
}
