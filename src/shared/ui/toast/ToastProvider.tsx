import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StandardEasing } from '@/shared/lib/motion';
import { IslandHeight, IslandMargin } from '@/shared/ui/TabBar';

const VisibleDurationMs = 2200;
const OpacityDuration = 260;
const TransformDuration = 420;
const OffsetY = 16;
const GapAboveIsland = 14;

type ToastContextValue = { showToast: (message: string) => void };
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
}

function ToastOverlay({ visible, message }: { visible: boolean; message: string | null }) {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    let targetOpacity = 0;
    if (visible) {
      targetOpacity = 1;
    }

    let targetY = OffsetY;
    if (visible) {
      targetY = 0;
    }

    return {
      opacity: withTiming(targetOpacity, { duration: OpacityDuration }),
      transform: [{ translateY: withTiming(targetY, { duration: TransformDuration, easing: StandardEasing }) }],
    };
  });

  if (message === null) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        animatedStyle,
        { left: IslandMargin, right: IslandMargin, bottom: insets.bottom + IslandMargin + IslandHeight + GapAboveIsland },
      ]}
      className="absolute bg-ct-ink px-4 py-[14px]">
      <Text className="text-sm font-medium text-ct-card">{message}</Text>
    </Animated.View>
  );
}

/** A single app-wide toast slot, shared so a screen that's about to unmount (e.g. after saving and navigating back) can still leave a confirmation visible on whatever screen the user lands on. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((nextMessage: string) => {
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
    }

    setMessage(nextMessage);
    setVisible(true);
    dismissTimerRef.current = setTimeout(() => setVisible(false), VisibleDurationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastOverlay visible={visible} message={message} />
    </ToastContext.Provider>
  );
}
