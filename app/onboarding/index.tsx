import { CATEGORIES, RESET_TIMES } from '@/components/onboarding/constants';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [resetTime, setResetTime] = useState('midnight');

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
      
      // Navigate to Login or Tabs (Logic in index.tsx handles the check, but we can direct navigate)
      // Since user is not logged in after onboarding, go to login
      // Navigate to Tabs
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : prev);

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
             <Button label="Get Things Done" onPress={nextStep} />
        </View>
    </View>
  );

  // --- Step 2: Info (Almost There) ---
  const renderStep2 = () => (
      <View className="flex-1 w-full max-w-md mx-auto justify-center items-center">
          <View className="mb-8 items-center">
               {/* Simple Arrow Graphic Placeholder */}
               <View className="flex-row items-center justify-center mb-8">
                   <View className="h-20 w-[2px] bg-[#E0E0E0] mx-4" />
                   <View className="h-[2px] w-20 bg-[#39FF14]" />
                   <View className="h-20 w-[2px] bg-[#E0E0E0] mx-4" />
               </View>

              <Text className="text-[#E0E0E0] text-3xl font-black uppercase tracking-wider text-center font-display">
                  ALMOST THERE
              </Text>
              <Text className="text-[#A0A0A0] text-base font-normal mt-4 text-center font-mono">
                  You can add your habits after setup is complete.
              </Text>
          </View>
          
          <View className="w-full mt-auto mb-6">
              <Button label="Get Started" onPress={nextStep} />
          </View>
      </View>
  );

  // --- Step 3: Preferences ---
  const renderStep3 = () => (
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
                      STEP {step} OF 3
                  </Text>
              </View>
              <View className="w-10" />
          </View>
          
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
      </View>
    </ScreenWrapper>
  );
}
