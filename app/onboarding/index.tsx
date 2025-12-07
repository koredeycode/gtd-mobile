import { CATEGORIES, RESET_TIMES } from '@/components/onboarding/constants';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [resetTime, setResetTime] = useState('midnight');

  // Step 2 & 3 State
  const [goalInput, setGoalInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHabits, setGeneratedHabits] = useState<any[]>([]);

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

  // Mock AI Generation
  const generateHabits = () => {
      if (!goalInput.trim() && selectedCategories.length === 0) return;
      
      setIsGenerating(true);
      
      // Simulate AI delay
      setTimeout(() => {
          const habits = [];
          // Simple mock logic based on categories
          if (selectedCategories.includes('health')) {
              habits.push({ id: 'h1', title: 'Morning Run', category: 'HEALTH' });
              habits.push({ id: 'h2', title: 'Evening Stretch', category: 'HEALTH' });
              habits.push({ id: 'h3', title: 'Drink Water', category: 'HEALTH' });
          }
           if (selectedCategories.includes('work')) {
              habits.push({ id: 'w1', title: 'Deep Work Session', category: 'WORK' });
              habits.push({ id: 'w2', title: 'Plan Tomorrow', category: 'WORK' });
          }
          if (selectedCategories.includes('mind')) {
              habits.push({ id: 'm1', title: '10 min Meditation', category: 'MINDFULNESS' });
              habits.push({ id: 'm2', title: 'Journaling', category: 'MINDFULNESS' });
          }
          if (selectedCategories.includes('learning')) {
              habits.push({ id: 'l1', title: 'Read 10 pages', category: 'LEARNING' });
          }
          // Default if empty or other cats
          if (habits.length === 0) {
               habits.push({ id: 'd1', title: 'Plan Day', category: 'PRODUCTIVITY' });
          }

          setGeneratedHabits(habits);
          setIsGenerating(false);
          setStep(3); // Move to Step 3
      }, 1500);
  };

  const removeHabit = (id: string) => {
      setGeneratedHabits(prev => prev.filter(h => h.id !== id));
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

        <ScrollView className="flex-1 space-y-2 pr-2" showsVerticalScrollIndicator={false}>
            {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
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
                            name={cat.icon as any} 
                            size={24} 
                            color={isSelected ? '#39FF14' : '#E0E0E0'} 
                            style={{ marginRight: 16 }}
                        />
                        <Text className="flex-1 text-base font-normal uppercase leading-normal text-[#E0E0E0] font-mono">
                            {cat.label}
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
                 <Button label="ACCEPT ALL" onPress={nextStep} />
                 
                 <TouchableOpacity 
                    onPress={generateHabits}
                    className="h-14 items-center justify-center border border-[#39FF14] active:bg-[#39FF14]/10"
                 >
                     <Text className="text-[#39FF14] font-bold uppercase tracking-widest font-mono">
                         GENERATE MORE
                     </Text>
                 </TouchableOpacity>
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
