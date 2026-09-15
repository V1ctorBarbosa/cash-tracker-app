import { Pressable, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  let backgroundColor: string;
  let textColor: string;
  if (selected) {
    backgroundColor = Colors.light.ink;
    textColor = Colors.light.card;
  } else {
    backgroundColor = 'transparent';
    textColor = Colors.light.ink;
  }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor }} className="border border-ct-ink px-[14px] py-[9px]">
      <Text style={{ color: textColor }} className="text-[13px] font-medium">
        {label}
      </Text>
    </Pressable>
  );
}
