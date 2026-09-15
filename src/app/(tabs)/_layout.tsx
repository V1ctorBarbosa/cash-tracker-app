import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { useSession } from '@/entities/session';
import { SelectedMonthProvider } from '@/shared/lib/selected-month-context';
import { TabBar } from '@/shared/ui/TabBar';

export default function TabsLayout() {
  const session = useSession();

  if (session.status === 'loading') {
    return null;
  }

  if (session.status === 'signed-out') {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SelectedMonthProvider>
      <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="new" />
        <Tabs.Screen name="budget" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </SelectedMonthProvider>
  );
}
