import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Get Things Done',
  slug: 'gtd',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  owner: 'korecodes',
  scheme: 'gtd',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.korecodes.gtd',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/icon.png',
      backgroundImage: './assets/images/icon.png',
      monochromeImage: './assets/images/icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.korecodes.gtd',
  },
  web: {
    output: 'static',
    favicon: './assets/images/icon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        image: './assets/images/icon.png',
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
    [
      'react-native-android-widget',
      {
        widgets: [
          {
            name: 'SmallWidget',
            label: 'GTD Progress',
            minWidth: '40dp',
            minHeight: '40dp',
            description: 'Your daily GSD progress',
            previewImage: './assets/images/small-widget.png',
          },
          {
            name: 'MediumWidget',
            label: 'GTD Tasks',
            minWidth: '200dp',
            minHeight: '100dp',
            description: 'Your top tasks',
            previewImage: './assets/images/medium-widget.png',
          },
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
