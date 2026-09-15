import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useTransactions } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

import { filterTransactions, groupByMonth, HistoryFilter } from './model/historico-view';

// Wide enough to capture "all transactions ever" for a personal-scale account without a
// dedicated backend count endpoint.
const AllTimeFrom = '2020-01-01';
const AllTimeTo = '2035-12-31';

const FilterOptions: { value: HistoryFilter; label: string }[] = [
  { value: HistoryFilter.All, label: 'tudo' },
  { value: HistoryFilter.Expenses, label: 'despesas' },
  { value: HistoryFilter.Income, label: 'receitas' },
  { value: HistoryFilter.Recurring, label: 'recorrentes' },
];

export function HistoricoPage() {
  const router = useRouter();
  const transactions = useTransactions(AllTimeFrom, AllTimeTo);
  const tags = useTags();

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>(HistoryFilter.All);

  if (transactions.isPending || tags.isPending) {
    return <SafeAreaView className="flex-1 bg-ct-paper" />;
  }

  if (transactions.isError || tags.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const filteredTransactions = filterTransactions(transactions.data, tags.data, searchText, filter);
  const groups = groupByMonth(filteredTransactions, tags.data);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-[18px] border-b border-ct-ink px-6 pb-4 pt-[26px]">
        <View className="flex-row items-baseline justify-between">
          <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
            histórico
          </Text>
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[11px] uppercase text-ct-muted">
            {transactions.data.length} itens
          </Text>
        </View>

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="buscar por descrição"
          placeholderTextColor={Colors.light.muted}
          className="border border-ct-divider bg-ct-card px-[14px] py-3 text-sm text-ct-ink"
        />

        <View className="flex-row flex-wrap gap-[7px]">
          {FilterOptions.map((option) => {
            const isSelected = filter === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setFilter(option.value)}
                style={{ backgroundColor: isSelected ? Colors.light.ink : 'transparent' }}
                className="border border-ct-ink px-3 py-[7px]">
                <Text style={{ color: isSelected ? Colors.light.card : Colors.light.ink }} className="text-xs font-medium">
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {groups.length === 0 && (
          <Text className="px-6 py-8 text-center text-sm text-ct-muted">Nenhum lançamento encontrado.</Text>
        )}
        {groups.map((group) => (
          <View key={group.month}>
            <View className="flex-row items-baseline justify-between border-b border-t border-t-ct-ink border-b-ct-divider bg-ct-group-bg px-6 pb-[10px] pt-[14px]">
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-ink">
                {group.month}
              </Text>
              <Text style={{ fontFamily: FontFamily.mono }} className="text-[10px] text-ct-muted">
                {group.total}
              </Text>
            </View>
            {group.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/transaction/${item.id}`)}
                className="flex-row items-center gap-[14px] border-b border-ct-row-divider px-6 py-[14px]">
                <Text style={{ fontFamily: FontFamily.mono }} className="w-[22px] text-[13px] text-ct-muted">
                  {item.day}
                </Text>
                <View className="h-2 w-2" style={{ backgroundColor: item.dot }} />
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-medium text-ct-ink" numberOfLines={1}>
                    {item.desc}
                  </Text>
                  <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] text-ct-muted" numberOfLines={1}>
                    {item.tag} · {item.method}
                    {item.rec.length > 0 ? ` ${item.rec}` : ''}
                  </Text>
                </View>
                <Text style={{ color: item.amountColor }} className="text-[15px] font-semibold">
                  {item.amount}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
