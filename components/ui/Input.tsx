import { cn } from '@/lib/utils';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ 
  label, 
  error, 
  className, 
  isPassword = false, 
  ...props 
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="mb-4 w-full">
      <Text className="text-[#E0E0E0] text-sm font-medium leading-normal pb-2 font-display uppercase">
        {label}
      </Text>
      <View className={cn(
        "flex-row items-center border bg-transparent h-14",
        isFocused ? "border-[#39FF14]" : "border-[#E0E0E0]",
        error ? "border-red-500" : ""
      )}>
        <TextInput
          className="flex-1 text-[#E0E0E0] px-4 text-base font-normal font-mono h-full"
          placeholderTextColor="#555555"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="px-3 h-full justify-center border-l border-[#E0E0E0]"
          >
            <MaterialIcons 
              name={showPassword ? "visibility" : "visibility-off"} 
              size={24} 
              color="#E0E0E0" 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
