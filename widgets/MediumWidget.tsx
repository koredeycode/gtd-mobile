import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WidgetData } from '../services/WidgetService';

interface MediumWidgetProps {
  data: WidgetData;
}

export const MediumWidget = ({ data }: MediumWidgetProps) => {
  const { topHabits, progress } = data;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>GSD / TODAY</Text>
          {progress === 100 && <Text style={styles.checkIcon}> ✓</Text>}
        </View>
        
        {/* Optional: Add date or other info on right if needed */}
      </View>

      <View style={styles.listContainer}>
        {topHabits.map((habit, index) => (
          <View key={habit.id} style={[styles.listItem, index < topHabits.length - 1 && styles.borderBottom]}>
            <View style={styles.itemLeft}>
              {/* Checkbox */}
              <View style={[styles.checkbox, habit.completed && styles.checkboxChecked]}>
                {habit.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              
              <Text style={[
                styles.itemTitle, 
                habit.completed && styles.itemTitleCompleted
              ]} numberOfLines={1}>
                {habit.title}
              </Text>
            </View>
            
            <View style={styles.itemRight}>
              <Text style={styles.streakText}>{habit.streak}d</Text>
            </View>
          </View>
        ))}
        
        {topHabits.length === 0 && (
          <Text style={styles.emptyText}>No active habits for today</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    borderRadius: 22,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#a3e635', // Lime Green for header text based on image
    fontSize: 12,
    fontFamily: 'JetBrainsMono-Bold',
    letterSpacing: 1,
  },
  checkIcon: {
    color: '#a3e635',
    fontSize: 12,
    marginLeft: 4,
  },
  listContainer: {
    flex: 1,
    justifyContent: 'space-around', // Distribute items vertically
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  borderBottom: {
    // Spacer or border? Image doesn't show dividers clearly but spacing is key
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#a3e635', // Green fill
    borderColor: '#a3e635',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'JetBrainsMono-Regular',
    flex: 1,
  },
  itemTitleCompleted: {
    color: '#71717a', // Dimmed
    textDecorationLine: 'line-through', // Optional: Strikethrough?
  },
  itemRight: {
     // Right alignment
  },
  streakText: {
    color: '#71717a', // Zinc 500
    fontSize: 12,
    fontFamily: 'JetBrainsMono-Regular',
  },
  emptyText: {
    color: '#71717a',
    fontSize: 12,
    fontStyle: 'italic',
  },
});
