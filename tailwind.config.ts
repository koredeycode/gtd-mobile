import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#39FF14',
        secondary: '#5856D6',
        background: '#000000',
        surface: '#1E293B',
        text: '#FFFFFF',
        'text-secondary': '#9CA3AF',
      },
      fontFamily: {
        sans: ['JetBrainsMono-Regular'],
        mono: ['JetBrainsMono-Regular'],
        'jb-bold': ['JetBrainsMono-Bold'],
        'jb-black': ['JetBrainsMono-ExtraBold'],
        'jb-light': ['JetBrainsMono-Light'],
        'jb-medium': ['JetBrainsMono-Medium'],
        'jb-italic': ['JetBrainsMono-Italic'],
        display: ['JetBrainsMono-Bold'],
        // Mapping common weights
        black: ['JetBrainsMono-ExtraBold'],
        bold: ['JetBrainsMono-Bold'],
        medium: ['JetBrainsMono-Medium'],
        regular: ['JetBrainsMono-Regular'],
        light: ['JetBrainsMono-Light'],
        thin: ['JetBrainsMono-Thin'],
      },
    },
  },
  plugins: [],
};

export default config;
