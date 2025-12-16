import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WidgetData } from '../services/WidgetService';

interface SmallWidgetProps {
  data: WidgetData;
}

export const SmallWidget = ({ data }: SmallWidgetProps) => {
  const { progress, completed, total } = data;
  const progressColor = '#a3e635'; // Lime green
  const iconColor = progress === 100 ? progressColor : '#52525b'; // Zinc 600

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>GSD / TODAY</Text>
        {/* Simple checkmark indicator */}
        <View style={[styles.statusDot, { backgroundColor: iconColor }]}>
           {progress === 100 && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </View>

      <View style={styles.content}>
        {/* Ring placeholder: Circle with text inside */}
        <View style={styles.ringContainer}>
          <Text style={styles.percentageText}>{progress}%</Text>
          <Text style={styles.fractionText}>{completed}/{total} DONE</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b', // Zinc 950
    borderRadius: 22,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'JetBrainsMono-Bold',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#27272a', // Zinc 800 (Incomplete part of ring background)
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    color: '#a3e635',
    fontSize: 24,
    fontFamily: 'JetBrainsMono-Bold',
  },
  fractionText: {
    color: '#a1a1aa',
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'JetBrainsMono-Regular',
  },
});
