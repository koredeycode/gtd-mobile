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
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'JetBrainsMono-Bold',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  ringContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: '#27272a', // Zinc 800
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    color: '#a3e635',
    fontSize: 26,
    fontFamily: 'JetBrainsMono-Bold',
  },
  fractionText: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'JetBrainsMono-Regular',
  },
});
