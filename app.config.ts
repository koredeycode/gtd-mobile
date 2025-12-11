import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'gtd-mobile',
  slug: 'gtd-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  owner: 'korecodes',
  scheme: 'gtdmobile',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.korecodes.gtdmobile',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.korecodes.gtdmobile',
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/JetBrainsMono-Bold.ttf',
          './assets/fonts/JetBrainsMono-BoldItalic.ttf',
          './assets/fonts/JetBrainsMono-ExtraBold.ttf',
          './assets/fonts/JetBrainsMono-ExtraBoldItalic.ttf',
          './assets/fonts/JetBrainsMono-ExtraLight.ttf',
          './assets/fonts/JetBrainsMono-ExtraLightItalic.ttf',
          './assets/fonts/JetBrainsMono-Italic.ttf',
          './assets/fonts/JetBrainsMono-Light.ttf',
          './assets/fonts/JetBrainsMono-LightItalic.ttf',
          './assets/fonts/JetBrainsMono-Medium.ttf',
          './assets/fonts/JetBrainsMono-MediumItalic.ttf',
          './assets/fonts/JetBrainsMono-Regular.ttf',
          './assets/fonts/JetBrainsMono-SemiBold.ttf',
          './assets/fonts/JetBrainsMono-SemiBoldItalic.ttf',
          './assets/fonts/JetBrainsMono-Thin.ttf',
          './assets/fonts/JetBrainsMono-ThinItalic.ttf',
        ],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    eas: {
      projectId: 'dddf36ee-6717-4081-bf0d-d568c30781f5',
    },
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
