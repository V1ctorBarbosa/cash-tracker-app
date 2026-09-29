import type { ReactNode } from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { StandardEasing } from '@/shared/lib/motion';

const OpacityDuration = 600;
const TransformDuration = 700;
const OffsetY = 28;

/** Fades and slides a block in the first time it becomes visible -- for content revealed on scroll or on a screen's first render, never popping in abruptly. */
export function Reveal({ revealed, children }: { revealed: boolean; children: ReactNode }) {
  const animatedStyle = useAnimatedStyle(() => {
    let targetY = OffsetY;
    if (revealed) {
      targetY = 0;
    }

    let targetOpacity = 0;
    if (revealed) {
      targetOpacity = 1;
    }

    return {
      opacity: withTiming(targetOpacity, { duration: OpacityDuration }),
      transform: [{ translateY: withTiming(targetY, { duration: TransformDuration, easing: StandardEasing }) }],
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
