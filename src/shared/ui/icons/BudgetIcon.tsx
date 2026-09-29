import Svg, { Circle } from 'react-native-svg';

const StrokeWidth = 1.8;

export function BudgetIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="7.5" stroke={color} strokeWidth={StrokeWidth} fill="none" />
    </Svg>
  );
}
