import type { BottomTabBarProps } from 'expo-router/tabs';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontFamily } from '@/constants/theme';
import { BudgetIcon } from '@/shared/ui/icons/BudgetIcon';
import { HistoryIcon } from '@/shared/ui/icons/HistoryIcon';
import { HomeIcon } from '@/shared/ui/icons/HomeIcon';
import { ProfileIcon } from '@/shared/ui/icons/ProfileIcon';

/** Kept out of the island -- launching a transaction is the most frequent action, so it gets its own always-visible button (NewTransactionFab) instead of competing for space as a fifth tab. */
export const NewTransactionRouteName = 'new';

export const IslandMargin = 36;
export const IslandHeight = 64;
const IconSize = 19;

const TabLabels: Record<string, string> = {
  index: 'início',
  history: 'histór.',
  budget: 'orçam.',
  profile: 'perfil',
};

const TabIcons: Record<string, ComponentType<{ size?: number; color: string }>> = {
  index: HomeIcon,
  history: HistoryIcon,
  budget: BudgetIcon,
  profile: ProfileIcon,
};

function TabBarItem({
  label,
  Icon,
  isFocused,
  onPress,
}: {
  label: string;
  Icon: ComponentType<{ size?: number; color: string }>;
  isFocused: boolean;
  onPress: () => void;
}) {
  let color: string;
  let backgroundColor: string;
  if (isFocused) {
    color = Colors.light.card;
    backgroundColor = Colors.light.ink;
  } else {
    color = Colors.light.navInactive;
    backgroundColor = 'transparent';
  }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor }} className="items-center gap-1 rounded-full px-4 py-2">
      <Icon size={IconSize} color={color} />
      <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4, color }} className="text-[9px] uppercase">
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * A floating pill island with icon+label tabs, entirely replacing React Navigation's default bar
 * via the `tabBar` render prop -- same approach the previous flat bar used. The margin on every
 * side is what makes it read as a floating island rather than a bar flush with the screen edges.
 *
 * The "+" for launching a transaction is deliberately NOT rendered here (see NewTransactionFab,
 * rendered as a sibling of the Tabs navigator instead): React Navigation measures a custom
 * tabBar's own rendered size to reserve space for it at the bottom of every screen, and a button
 * poking above this bar via absolute positioning gets folded into that measurement, inflating it
 * and pushing the whole bar far higher up the screen than intended.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => route.name !== NewTransactionRouteName);
  const focusedRouteKey = state.routes[state.index]?.key;

  function navigateTo(routeKey: string, routeName: string, routeParams: object | undefined) {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!event.defaultPrevented) {
      navigation.navigate(routeName, routeParams);
    }
  }

  return (
    <View className="bg-ct-paper" style={{ paddingHorizontal: IslandMargin, paddingBottom: insets.bottom + IslandMargin }}>
      <View className="flex-row items-center justify-around rounded-full border border-ct-ink bg-ct-card" style={{ height: IslandHeight }}>
        {visibleRoutes.map((route) => (
          <TabBarItem
            key={route.key}
            label={TabLabels[route.name] ?? route.name}
            Icon={TabIcons[route.name]}
            isFocused={route.key === focusedRouteKey}
            onPress={() => navigateTo(route.key, route.name, route.params)}
          />
        ))}
      </View>
    </View>
  );
}
