import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 items-center justify-center gap-2 px-6">
        <ThemedText type="title">Cash Track</ThemedText>
        <ThemedText type="small" className="text-center">
          Gestão de receitas, despesas e orçamento pessoal.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}
