import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#000000',
                borderTopColor: '#333333',
                height: 60,
                paddingBottom: 10,
            },
            tabBarActiveTintColor: '#39FF14',
            tabBarInactiveTintColor: '#888888',
            tabBarShowLabel: false,
        }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <MaterialIcons name="today" size={28} color={color} />,
          tabBarLabel: 'Tasks',
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: 'JetBrainsMono-Bold', fontSize: 10, marginBottom: 4 },
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <MaterialIcons name="check-circle" size={28} color={color} />,
          tabBarLabel: 'Habits',
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: 'JetBrainsMono-Bold', fontSize: 10, marginBottom: 4 },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={28} color={color} />,
          tabBarLabel: 'Settings',
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: 'JetBrainsMono-Bold', fontSize: 10, marginBottom: 4 },
        }}
      />
    </Tabs>
  );
}
