import React from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { WidgetData } from '../services/WidgetService';

interface SmallWidgetProps {
  data: WidgetData;
}

export const SmallWidget = ({ data }: SmallWidgetProps) => {
  const { progress, completed, total } = data;
  const progressColor = '#a3e635'; // Lime green
  
  // Ring configuration
  const size = 108;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // SVG XML Construction
  const checkmarkSvg = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  const ringSvg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="#27272a" stroke-width="${strokeWidth}" fill="none" />
      <circle cx="${size/2}" cy="${size/2}" r="${radius}" stroke="${progressColor}" stroke-width="${strokeWidth}" fill="none"
        stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"
        transform="rotate(-90 ${size/2} ${size/2})" />
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
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="GSD / TODAY"
          style={{
            color: '#ffffff',
            fontSize: 12,
            fontFamily: 'JetBrainsMono-Bold',
            letterSpacing: 0.5,
          }}
        />
        
        {/* Status Dot */}
        <FlexWidget
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: progress === 100 ? '#a3e635' : '#27272a',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {progress === 100 && (
            <SvgWidget
              svg={checkmarkSvg}
              style={{ width: 12, height: 12 }}
            />
          )}
        </FlexWidget>
      </FlexWidget>

      {/* Content */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 8,
          width: 'match_parent',
        }}
      >
        <OverlapWidget
          style={{
            width: 88,
            height: 88,
          }}
        >
          {/* SVG Ring Layer */}
          <SvgWidget
            svg={ringSvg}
            style={{ width: size, height: size }}
          />

          {/* Text Layer - Centered */}
          <FlexWidget
            style={{
                width: 'match_parent',
                height: 'match_parent',
                justifyContent: 'center',
                alignItems: 'center',
            }}
          >
            <TextWidget
              text={`${progress}%`}
              style={{
                color: '#a3e635',
                fontSize: 24,
                fontFamily: 'JetBrainsMono-Bold',
              }}
            />
            <TextWidget
              text={`${completed}/${total} DONE`}
              style={{
                color: '#a1a1aa',
                fontSize: 10,
                marginTop: 4,
                fontFamily: 'JetBrainsMono-Regular',
              }}
            />
          </FlexWidget>
        </OverlapWidget>
      </FlexWidget>
    </FlexWidget>
  );
};
