import { StatusBar } from 'expo-status-bar';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  bg?: string;
  statusBarStyle?: 'light' | 'dark' | 'auto';
}

export function ScreenWrapper({
  children,
  bg = 'bg-background',
  style,
  statusBarStyle = 'light',
  ...props
}: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className={`flex-1 ${bg}`} 
      style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, style]} 
      {...props}
    >
      <StatusBar style={statusBarStyle} />
      {children}
    </View>
  );
}
