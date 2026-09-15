import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const BarCount = 5;
const BarWidthRatio = 0.22;
const BarStaggerSeconds = 0.12;
const PulseHalfDurationMs = 525;
const MinScale = 0.28;
const MaxScale = 1;

function LoaderBar({ width, height, color, delaySeconds }: { width: number; height: number; color: string; delaySeconds: number }) {
  const scale = useSharedValue(MinScale);

  useEffect(() => {
    scale.value = withDelay(
      delaySeconds * 1000,
      withRepeat(
        withSequence(
          withTiming(MaxScale, { duration: PulseHalfDurationMs, easing: Easing.inOut(Easing.ease) }),
          withTiming(MinScale, { duration: PulseHalfDurationMs, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      ),
    );
  }, [scale, delaySeconds]);

  const animatedStyle = useAnimatedStyle(() => ({ height: `${scale.value * 100}%` }));

  return (
    <View style={{ width, height, justifyContent: 'flex-end' }}>
      <Animated.View style={[{ width, backgroundColor: color }, animatedStyle]} />
    </View>
  );
}

/** Five pulsing bars, echoing the dashboard's own month-comparison chart -- the app's one loading indicator, used everywhere data is in flight. */
export function Loader({ size, color }: { size: number; color: string }) {
  const barWidth = size * BarWidthRatio;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: size, gap: barWidth }}>
      {Array.from({ length: BarCount }, (_, index) => (
        <LoaderBar key={index} width={barWidth} height={size} color={color} delaySeconds={index * BarStaggerSeconds} />
      ))}
    </View>
  );
}
