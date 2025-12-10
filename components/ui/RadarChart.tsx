import { View } from 'react-native';
import { RadarChart as GiftedRadarChart } from 'react-native-gifted-charts';

interface RadarChartProps {
    data: number[]; // Array of values 0-100
    labels: string[];
    size?: number;
    color?: string;
}

export function RadarChart({ data, labels, size = 250, color = '#39FF14' }: RadarChartProps) {
    return (
        <View className="items-center justify-center">
            {/* Types corrected */}
            <GiftedRadarChart
                // Polygon Specifics
                polygonConfig={{
                    stroke: color,
                    strokeWidth: 5,
                    fill: color,
                    opacity: 0.4,
                    showGradient: true,
                    gradientColor: '#00000000',
                }}

                // Grid / Axis Styling
                gridConfig={{
                    stroke: '#00000000',
                    strokeWidth: 0,
                    opacity: 0,
                    fill: '#00000000',
                }}
                hideGrid
                hideAsterLines
                
                // Pass empty labels matching data length to avoid internal errors
                labels={data.map(() => '')} 

                data={data}
                maxValue={100}
                chartSize={size}
            />
        </View>
    );
}
