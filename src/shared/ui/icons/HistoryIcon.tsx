import Svg, { Line } from 'react-native-svg';

const StrokeWidth = 2;

export function HistoryIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="4" y1="7" x2="20" y2="7" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
      <Line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
      <Line x1="4" y1="17" x2="20" y2="17" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
