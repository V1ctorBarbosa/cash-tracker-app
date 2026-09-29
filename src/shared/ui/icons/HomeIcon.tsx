import Svg, { Line } from 'react-native-svg';

const StrokeWidth = 2.4;

/** Three ascending bars, echoing the dashboard's own bar charts. */
export function HomeIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="6" y1="19" x2="6" y2="14" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
      <Line x1="12" y1="19" x2="12" y2="10" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
      <Line x1="18" y1="19" x2="18" y2="6" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" />
    </Svg>
  );
}
