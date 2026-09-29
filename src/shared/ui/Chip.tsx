import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const ColorTransitionDuration = 200;

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const animatedContainerStyle = useAnimatedStyle(() => {
    let targetBackground: string = Colors.light.ink;
    if (!selected) {
      targetBackground = 'transparent';
    }

    return { backgroundColor: withTiming(targetBackground, { duration: ColorTransitionDuration }) };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    let targetColor: string = Colors.light.card;
    if (!selected) {
      targetColor = Colors.light.ink;
    }

    return { color: withTiming(targetColor, { duration: ColorTransitionDuration }) };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={animatedContainerStyle} className="border border-ct-ink px-[14px] py-[9px]">
        <Animated.Text style={[{ fontSize: 13, fontWeight: '500' }, animatedTextStyle]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
