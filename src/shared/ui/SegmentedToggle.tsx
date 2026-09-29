import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { StandardEasing } from '@/shared/lib/motion';

const HighlightSlideDuration = 320;
const TextColorTransitionDuration = 240;

type SegmentedToggleOption<TValue extends string> = { label: string; value: TValue };

function SegmentedToggleItem({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  const animatedTextStyle = useAnimatedStyle(() => {
    let targetColor: string = Colors.light.card;
    if (!isSelected) {
      targetColor = Colors.light.ink;
    }

    return { color: withTiming(targetColor, { duration: TextColorTransitionDuration }) };
  });

  return (
    <Pressable onPress={onPress} className="z-10 flex-1 items-center py-[13px]">
      <Animated.Text style={[{ fontSize: 14, fontWeight: '600' }, animatedTextStyle]}>{label}</Animated.Text>
    </Pressable>
  );
}

/** A two-or-more-way toggle with a sliding highlight instead of each option swapping its own background instantly -- despesa/receita everywhere it appears (new/edit transaction, new tag). */
export function SegmentedToggle<TValue extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: SegmentedToggleOption<TValue>[];
  selectedValue: TValue;
  onSelect: (value: TValue) => void;
}) {
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  const optionCount = options.length;
  const highlightPosition = useSharedValue(selectedIndex);

  useEffect(() => {
    highlightPosition.value = withTiming(selectedIndex, { duration: HighlightSlideDuration, easing: StandardEasing });
  }, [selectedIndex, highlightPosition]);

  const animatedHighlightStyle = useAnimatedStyle(() => ({
    left: `${(highlightPosition.value / optionCount) * 100}%`,
  }));

  return (
    <View className="flex-row border border-ct-ink">
      <Animated.View
        className="absolute bottom-0 top-0 bg-ct-ink"
        style={[animatedHighlightStyle, { width: `${100 / optionCount}%` }]}
      />
      {options.map((option) => (
        <SegmentedToggleItem
          key={option.value}
          label={option.label}
          isSelected={option.value === selectedValue}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}
