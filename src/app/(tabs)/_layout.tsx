import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { useSession } from '@/entities/session';
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
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="lancar" />
      <Tabs.Screen name="orcamento" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
