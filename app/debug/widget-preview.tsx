import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WidgetPreview } from 'react-native-android-widget';
import { getWidgetData, WidgetData } from '../../services/WidgetService';
import { MediumWidget } from '../../widgets/MediumWidget';
import { SmallWidget } from '../../widgets/SmallWidget';

export default function WidgetPreviewScreen() {
  const [data, setData] = useState<WidgetData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const widgetData = await getWidgetData();
    setData(widgetData);
  };

  if (!data) return <View style={styles.container}><Text style={styles.text}>Loading data...</Text></View>;

  return (
    <>
      <Stack.Screen options={{ title: 'Widget Preview', headerBackTitle: 'Debug' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          These are previews of how the widgets might look. 
          Note that actual Android widgets have some constraints that standard React Native views don't, 
          but this is great for tweaking colors and layout.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Small Widget (40x40dp usually, ~160x160px)</Text>
          <View style={styles.previewContainerSmall}>
             <WidgetPreview
                renderWidget={() => <SmallWidget data={data} />}
                width={160}
                height={160}
                showBorder
             />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Medium Widget (200x100dp usually, ~full width)</Text>
          <View style={styles.previewContainerMedium}>
             <WidgetPreview
                renderWidget={() => <MediumWidget data={data} />}
                width={320}
                height={160}
                showBorder
             />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={loadData}>
            <Text style={styles.buttonText}>Refresh Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
    gap: 30,
  },
  text: {
    color: '#fff',
  },
  description: {
    color: '#a1a1aa',
    marginBottom: 20,
  },
  section: {
    gap: 10,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewContainerSmall: {
    // Width and height controlled by WidgetPreview
    alignItems: 'center',
  },
  previewContainerMedium: {
    // Width and height controlled by WidgetPreview
    alignItems: 'center',
    width: '100%',
  },
  button: {
      backgroundColor: '#333',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
  },
  buttonText: {
      color: '#fff',
      fontWeight: 'bold',
  }
});
