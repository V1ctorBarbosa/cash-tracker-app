import Svg, { Circle, Path } from 'react-native-svg';

const StrokeWidth = 1.8;

export function ProfileIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8.2" r="3.4" stroke={color} strokeWidth={StrokeWidth} fill="none" />
      <Path d="M5 20c0-4.1 3.5-6.6 7-6.6s7 2.5 7 6.6" stroke={color} strokeWidth={StrokeWidth} strokeLinecap="round" fill="none" />
    </Svg>
  );
}
