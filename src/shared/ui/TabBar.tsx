import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontFamily } from '@/constants/theme';

const TabLabels: Record<string, string> = {
  index: 'início',
  history: 'histórico',
  new: 'lançar',
  budget: 'orçamento',
  profile: 'perfil',
};

/**
 * A flat row of mono uppercase labels with no icons, matching the design exactly -- the default
 * React Navigation tab bar always reserves icon space and adds its own chrome, so this replaces
 * it entirely via the `tabBar` render prop instead of trying to reskin it into this shape.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-ct-ink bg-ct-paper px-6 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label = TabLabels[route.name] ?? route.name;

        function handlePress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }

        return (
          <Pressable key={route.key} onPress={handlePress} className="flex-1 items-center">
            <Text
              style={{ fontFamily: FontFamily.mono, letterSpacing: 0.45, color: isFocused ? Colors.light.ink : Colors.light.navInactive }}
              className="text-[9px] uppercase">
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
