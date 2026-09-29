import { useRouter } from 'expo-router';
import { Pressable, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { IslandHeight, IslandMargin } from '@/shared/ui/TabBar';

const NewTransactionPath = '/(tabs)/new';
const FabSize = 60;
const FabGap = 14;

/** How much extra the fab pokes above the island bar -- the tab navigator already reserves space for the island itself, but not for this, since the fab lives outside that reservation. */
const FabClearance = FabSize + FabGap;
const ScreenContentBottomPadding = 32;

/** Bottom padding every scrollable tab screen needs on its content so the fab never overlaps the last item. */
export const FloatingNavContentClearance = ScreenContentBottomPadding + FabClearance;

/**
 * Rendered as a sibling of the Tabs navigator, not inside TabBar's own tree -- see TabBar's
 * comment for why a button floating above the custom tab bar has to live outside it.
 *
 * Positioned via `top` computed from the real window height rather than `bottom`, because a
 * `bottom` offset is only as good as its container's own measured height -- and the tabs
 * navigator's internal layout doesn't reliably hand that back up to a sibling wrapper. Anchoring
 * to the window's actual height sidesteps that entirely.
 */
export function NewTransactionFab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const topOffset = windowHeight - insets.bottom - IslandMargin - IslandHeight - FabGap - FabSize;

  return (
    <Pressable
      onPress={() => router.push(NewTransactionPath)}
      accessibilityLabel="novo lançamento"
      className="absolute items-center justify-center rounded-full bg-ct-ink"
      style={{ width: FabSize, height: FabSize, right: IslandMargin, top: topOffset }}>
      <Text style={{ color: Colors.light.card }} className="text-[28px] leading-[30px]">
        +
      </Text>
    </Pressable>
  );
}
