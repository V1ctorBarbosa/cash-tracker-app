import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRecurringTransactions } from '@/entities/recurring-transaction';
import { useTags } from '@/entities/tag';
import { FontFamily } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { buildRecurringRows, countActiveRecurring } from './model/recorrentes-view';

export function RecorrentesPage() {
  const router = useRouter();
  const recurringTransactions = useRecurringTransactions();
  const tags = useTags();

  if (recurringTransactions.isPending || tags.isPending) {
    return <SafeAreaView className="flex-1 bg-ct-paper" />;
  }

  if (recurringTransactions.isError || tags.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const rows = buildRecurringRows(recurringTransactions.data, tags.data);
  const activeCount = countActiveRecurring(recurringTransactions.data);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-2 border-b border-ct-ink px-6 pb-4 pt-[26px]">
        <View className="flex-row items-baseline justify-between">
          <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
            recorrentes
          </Text>
          <Pressable onPress={() => router.push({ pathname: '/lancar', params: { recurring: 'true' } })}>
            <Text className="text-[15px] font-semibold text-ct-ink">+ nova</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10.5px] text-ct-muted">
          {activeCount === 1 ? '1 ativa' : `${activeCount} ativas`} · geradas ao abrir o mês
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rows.length === 0 && <Text className="px-6 py-8 text-center text-sm text-ct-muted">Nenhuma recorrência ainda.</Text>}
        {rows.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => router.push({ pathname: '/recorrentes/[id]', params: { id: row.id } })}
            style={{ opacity: row.opacity }}
            className="gap-2 border-b border-ct-row-divider px-6 py-4">
            <View className="flex-row items-baseline justify-between gap-3">
              <Text className="text-base font-medium text-ct-ink">{row.name}</Text>
              <Text className="text-[15px] font-semibold text-ct-ink">{row.amount}</Text>
            </View>
            <View className="flex-row items-center justify-between gap-3">
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted">
                {row.tag} · {row.meta}
              </Text>
              <Text
                style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4, backgroundColor: row.stateBg, color: row.stateFg }}
                className="border border-ct-ink px-2 py-[3px] text-[9.5px] uppercase">
                {row.state}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View className="px-6 pb-6 pt-[22px]">
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[10px] uppercase text-ct-muted">
          pausar mantém o histórico já gerado
        </Text>
      </View>
    </SafeAreaView>
  );
}
