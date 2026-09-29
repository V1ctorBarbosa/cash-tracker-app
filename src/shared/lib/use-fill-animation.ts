import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { StandardEasing } from '@/shared/lib/motion';

/** Animates a bar's width from 0 to `targetPercent` once `revealed` flips true, and smoothly retargets if `targetPercent` changes afterward (e.g. switching to a month with different totals). */
export function useFillWidth(targetPercent: number, revealed: boolean, delayMs: number, durationMs: number) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (revealed) {
      progress.value = withDelay(delayMs, withTiming(targetPercent, { duration: durationMs, easing: StandardEasing }));
    }
  }, [revealed, targetPercent, delayMs, durationMs, progress]);

  return useAnimatedStyle(() => ({ width: `${progress.value}%` }));
}

/** Same as useFillWidth, for a bar that grows vertically instead. */
export function useFillHeight(targetPercent: number, revealed: boolean, delayMs: number, durationMs: number) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (revealed) {
      progress.value = withDelay(delayMs, withTiming(targetPercent, { duration: durationMs, easing: StandardEasing }));
    }
  }, [revealed, targetPercent, delayMs, durationMs, progress]);

  return useAnimatedStyle(() => ({ height: `${progress.value}%` }));
}
