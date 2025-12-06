import React, { useEffect, useRef } from 'react';
import { Animated, Easing, TouchableOpacity } from 'react-native';

interface BrutalistSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  trackColor?: { false: string; true: string };
  thumbColor?: { false: string; true: string };
}

export function BrutalistSwitch({
  value,
  onValueChange,
  trackColor = { false: '#333333', true: '#39FF14' },
  thumbColor = { false: '#f4f3f4', true: 'black' },
}: BrutalistSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false, // Background color doesn't support native driver usually, but layout does. We'll use layout.
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // adjust based on width
  });

  // Interpolating background color for the track
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColor.false, trackColor.true],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View
        style={{
          width: 44,
          height: 24,
          backgroundColor: backgroundColor,
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: value ? trackColor.true : '#555', // Optional border logic
        }}
      >
        <Animated.View
          style={{
            width: 16,
            height: 16,
            backgroundColor: value ? thumbColor.true : thumbColor.false,
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
