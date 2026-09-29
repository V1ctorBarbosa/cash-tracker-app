import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';

import { useSession } from '@/entities/session';
import { useSyncUserProfile } from '@/entities/user-profile';
import type { AuthUser } from '@/shared/api/auth-gateway';
import { SelectedMonthProvider } from '@/shared/lib/selected-month-context';
import { NewTransactionFab } from '@/shared/ui/NewTransactionFab';
import { TabBar } from '@/shared/ui/TabBar';

function SignedInTabsLayout({ user }: { user: AuthUser }) {
  useSyncUserProfile(user);

  return (
    <SelectedMonthProvider>
      <View style={StyleSheet.absoluteFill}>
        <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="history" />
          <Tabs.Screen name="new" />
          <Tabs.Screen name="budget" />
          <Tabs.Screen name="profile" />
        </Tabs>
        <NewTransactionFab />
      </View>
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
