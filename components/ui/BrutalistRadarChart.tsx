import { Text, View } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Polygon, Stop } from 'react-native-svg';

interface RadarChartProps {
    data: number[]; // Array of values 0-100
    labels: string[];
    size?: number;
    color?: string;
}

export function BrutalistRadarChart({ data, labels, size = 250, color = '#39FF14' }: RadarChartProps) {
    const radius = 40; // effective drawing radius in 0-50 coordinate space (excluding padding)
    const center = 50;
    
    // Calculate vertices for a regular polygon (6 sides)
    const getPolygonPoints = (r: number) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    };

    // Calculate vertices for data points
    const getDataPoints = () => {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const value = (data[i] || 0) / 100 * radius;
            const x = center + value * Math.cos(angle);
            const y = center + value * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    };

    return (
        <View className="items-center justify-center relative" style={{ height: size, width: size }}>
            <Svg height="100%" width="100%" viewBox="0 0 100 100">
                <Defs>
                    <LinearGradient id="radarGradient" x1="50" y1="0" x2="50" y2="100">
                        <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={color} stopOpacity="0.1" />
                    </LinearGradient>
                </Defs>

                {/* Grid Rings */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <Polygon
                        key={i}
                        points={getPolygonPoints(radius * scale)}
                        stroke={color}
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        fill="none"
                    />
                ))}

                {/* Axes */}
                {[0, 1, 2].map(i => {
                   const angle = (Math.PI / 3) * i - Math.PI / 2;
                   const x = center + radius * Math.cos(angle);
                   const y = center + radius * Math.sin(angle);
                   // Opposite point
                   const x2 = center + radius * Math.cos(angle + Math.PI);
                   const y2 = center + radius * Math.sin(angle + Math.PI);
                   return <Line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeOpacity="0.3" strokeWidth="0.5" />;
                })}

                {/* Data Polygon */}
                <Polygon
                    points={getDataPoints()}
                    fill="url(#radarGradient)"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </Svg>

            {/* Labels - positioned absolutely for better control than SVG Text */}
            {labels.map((label, i) => {
                 // Manual offsets to match hex positions
                 // Top, TopRight, BottomRight, Bottom, BottomLeft, TopLeft
                 const positions = [
                     "top-0 left-[42%]",       // Work
                     "top-[25%] -right-2",    // Mind
                     "bottom-[25%] -right-4", // Finance
                     "bottom-0 left-[42%]",    // Health
                     "bottom-[25%] -left-4",  // Social
                     "top-[25%] -left-2"      // Habits
                 ];
                 return (
                     <Text 
                        key={i} 
                        className={`absolute text-white text-[10px] font-bold font-mono tracking-wider ${positions[i]}`}
                     >
                        {label}
                     </Text>
                 );
            })}
        </View>
    );
}
