import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getWidgetData } from './services/WidgetService';
import { SmallWidget } from './widgets/SmallWidget';
import { MediumWidget } from './widgets/MediumWidget';


export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  
  // Fetch data
  const data = await getWidgetData();

  switch (widgetInfo.widgetName) {
    case 'SmallWidget':
      props.renderWidget(<SmallWidget data={data} />);
      break;
    case 'MediumWidget':
      props.renderWidget(<MediumWidget data={data} />);
      break;
    default:
      break;
  }
}
