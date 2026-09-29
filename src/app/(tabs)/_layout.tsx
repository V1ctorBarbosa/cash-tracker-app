import { Redirect } from 'expo-router';
import { Tabs, type BottomTabNavigationOptions } from 'expo-router/tabs';
import { Dimensions, Easing, StyleSheet, View } from 'react-native';

import { useSession } from '@/entities/session';
import { useSyncUserProfile } from '@/entities/user-profile';
import type { AuthUser } from '@/shared/api/auth-gateway';
import { SelectedMonthProvider } from '@/shared/lib/selected-month-context';
import { NewTransactionFab } from '@/shared/ui/NewTransactionFab';
import { TabBar } from '@/shared/ui/TabBar';
import { ToastProvider } from '@/shared/ui/toast/ToastProvider';

type SceneStyleInterpolator = NonNullable<BottomTabNavigationOptions['sceneStyleInterpolator']>;
type TabTransitionSpec = NonNullable<BottomTabNavigationOptions['transitionSpec']>;

const TabSlideDurationMs = 440;
// The bottom-tabs scene transition runs on the classic React Native `Animated` module, not
// Reanimated, so this can't reuse shared/lib/motion's StandardEasing (built on Reanimated's own
// Easing) -- same curve, but each integration point needs the easing function its own animation
// engine produces.
const TabSlideEasing = Easing.bezier(0.22, 0.8, 0.24, 1);

const tabSlideTransitionSpec: TabTransitionSpec = {
  animation: 'timing',
  config: { duration: TabSlideDurationMs, easing: TabSlideEasing },
};

/** Slides the incoming tab in from the direction it's coming from, and the outgoing one out the other side -- full width, not the built-in "shift" preset's bare ±50px nudge. */
const interpolateTabSlide: SceneStyleInterpolator = ({ current }) => {
  const { width } = Dimensions.get('window');

  return {
    sceneStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-width, 0, width],
          }),
        },
      ],
    },
  };
};

function SignedInTabsLayout({ user }: { user: AuthUser }) {
  useSyncUserProfile(user);

  return (
    <SelectedMonthProvider>
      <ToastProvider>
        <View style={StyleSheet.absoluteFill}>
          <Tabs
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ headerShown: false, sceneStyleInterpolator: interpolateTabSlide, transitionSpec: tabSlideTransitionSpec }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="history" />
            <Tabs.Screen name="new" />
            <Tabs.Screen name="budget" />
            <Tabs.Screen name="profile" />
          </Tabs>
          <NewTransactionFab />
        </View>
      </ToastProvider>
    </SelectedMonthProvider>
  );
}

export default function TabsLayout() {
  const session = useSession();

  if (session.status === 'loading') {
    return null;
  }

  if (session.status === 'signed-out') {
    return <Redirect href="/sign-in" />;
  }

  return <SignedInTabsLayout user={session.user} />;
}
