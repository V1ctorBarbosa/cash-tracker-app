import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signOutOfSession } from '@/features/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function HomePage({ userEmail }: { userEmail: string | null }) {
  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 items-center justify-center gap-2 px-6">
        <ThemedText type="title">Cash Track</ThemedText>
        {userEmail !== null && <ThemedText type="small">Conectado como {userEmail}</ThemedText>}
        <Pressable onPress={() => signOutOfSession()} className="mt-6 rounded-xl bg-ct-expense px-5 py-3">
          <Text className="text-base font-bold text-white">Sair</Text>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
