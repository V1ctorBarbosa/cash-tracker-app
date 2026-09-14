import { Pressable, Text } from 'react-native';

import { Colors } from '@/constants/theme';

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ backgroundColor: selected ? Colors.light.ink : 'transparent' }}
      className="border border-ct-ink px-[14px] py-[9px]">
      <Text style={{ color: selected ? Colors.light.card : Colors.light.ink }} className="text-[13px] font-medium">
        {label}
      </Text>
    </Pressable>
  );
}
