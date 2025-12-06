import { cn } from '@/lib/utils';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  textClassName?: string;
}

export function Button({ 
  label, 
  variant = 'primary', 
  className, 
  textClassName,
  ...props 
}: ButtonProps) {
  const baseStyles = "h-14 w-full items-center justify-center rounded-none active:opacity-90";
  const variants = {
    primary: "bg-[#39FF14]", // Acid Green
    secondary: "bg-surface border border-[#E0E0E0]",
    outline: "bg-transparent border border-[#E0E0E0]",
  };
  
  const textBaseStyles = "text-lg font-bold uppercase tracking-wider font-display";
  const textVariants = {
    primary: "text-black",
    secondary: "text-[#E0E0E0]",
    outline: "text-[#E0E0E0]",
  };

  return (
    <TouchableOpacity 
      className={cn(baseStyles, variants[variant], className)} 
      {...props}
    >
      <Text className={cn(textBaseStyles, textVariants[variant], textClassName)}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
