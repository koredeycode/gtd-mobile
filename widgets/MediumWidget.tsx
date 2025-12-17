import React from 'react';
import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { WidgetData } from '../services/WidgetService';

interface MediumWidgetProps {
  data: WidgetData;
}

export const MediumWidget = ({ data }: MediumWidgetProps) => {
  const { topHabits, progress } = data;

  // SVG Strings
  const headerCheckSvg = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="#a3e635" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const itemCheckSvg = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#09090b',
        borderRadius: 22,
        padding: 16,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          paddingBottom: 8,
          // borderBottomWidth: 1, // Borders can be tricky in flex widget, keeping simple
          // borderBottomColor: '#27272a',
          width: 'match_parent',
        }}
      >
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text="GSD / TODAY"
            style={{
              color: '#a3e635',
              fontSize: 13,
              fontFamily: 'JetBrainsMono-Bold',
              letterSpacing: 1,
            }}
          />
          {progress === 100 && (
            <FlexWidget style={{ marginLeft: 6 }}>
              <SvgWidget svg={headerCheckSvg} style={{ width: 14, height: 14 }} />
            </FlexWidget>
          )}
        </FlexWidget>
      </FlexWidget>

      {/* List Container */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          width: 'match_parent',
        }}
      >
        {topHabits.map((habit, index) => (
          <FlexWidget
            key={habit.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
              width: 'match_parent',
            }}
          >
            <FlexWidget
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}
            >
              {/* Checkbox */}
              <FlexWidget
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 2,
                  borderColor: habit.completed ? '#a3e635' : '#52525b',
                  borderRadius: 11,
                  backgroundColor: habit.completed ? '#a3e635' : '#00000000',
                  marginRight: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {habit.completed && (
                   <SvgWidget svg={itemCheckSvg} style={{ width: 12, height: 12 }} />
                )}
              </FlexWidget>
              
              <TextWidget
                text={habit.title}
                style={{
                  color: habit.completed ? '#71717a' : '#ffffff',
                  fontSize: 14,
                  fontFamily: 'JetBrainsMono-Regular',
                  // textDecorationLine not supported in android widget
                  // textDecorationLine: habit.completed ? 'line-through' : 'none',
                  // flex: 1, // 'flex' not supported in TextWidgetStyle
                }}
                maxLines={1}
              />
            </FlexWidget>
            
            <FlexWidget>
              <TextWidget
                text={`${habit.streak}d`}
                style={{
                  color: '#71717a',
                  fontSize: 12,
                  fontFamily: 'JetBrainsMono-Regular',
                }}
              />
            </FlexWidget>
          </FlexWidget>
        ))}
        
        {topHabits.length === 0 && (
          <TextWidget
            text="No active habits for today"
            style={{
              color: '#71717a',
              fontSize: 13,
              fontStyle: 'italic',
              marginTop: 8,
            }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
};
