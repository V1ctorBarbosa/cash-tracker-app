import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useTransactions } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { formatMonthLong, getMonthDateRange } from '@/shared/lib/date';
import { useSelectedMonth } from '@/shared/lib/selected-month-context';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { PageLoader } from '@/shared/ui/PageLoader';

import { buildHistorySummary, filterTransactions, HistoryFilter } from './model/history-view';

const FilterOptions: { value: HistoryFilter; label: string }[] = [
  { value: HistoryFilter.All, label: 'tudo' },
  { value: HistoryFilter.Expenses, label: 'despesas' },
  { value: HistoryFilter.Income, label: 'receitas' },
  { value: HistoryFilter.Recurring, label: 'recorrentes' },
];

export function HistoryPage() {
  const router = useRouter();
  const { year, month, goToPreviousMonth, goToNextMonth } = useSelectedMonth();
  const range = getMonthDateRange(year, month);
  const transactions = useTransactions({ from: range.from, to: range.to });
  const tags = useTags();

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>(HistoryFilter.All);

  if (transactions.isPending || tags.isPending) {
    return <PageLoader />;
  }

  if (transactions.isError || tags.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const filteredTransactions = filterTransactions(transactions.data, tags.data, searchText, filter);
  const summary = buildHistorySummary(filteredTransactions, tags.data);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-[18px] border-b border-ct-ink px-6 pb-4 pt-[26px]">
        <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
          histórico
        </Text>

        <View className="flex-row items-center justify-between border-y border-ct-ink py-[10px]">
          <Pressable onPress={goToPreviousMonth} hitSlop={12}>
            <Text className="text-lg text-ct-muted">‹</Text>
          </Pressable>
          <Text className="text-[15px] font-semibold tracking-wide text-ct-ink">{formatMonthLong(year, month)}</Text>
          <Pressable onPress={goToNextMonth} hitSlop={12}>
            <Text className="text-lg text-ct-muted">›</Text>
          </Pressable>
        </View>

        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="buscar por descrição"
          placeholderTextColor={Colors.light.muted}
          className="border border-ct-divider bg-ct-card px-[14px] py-3 text-sm text-ct-ink"
        />

        <View className="flex-row flex-wrap gap-[7px]">
          {FilterOptions.map((option) => (
            <Chip key={option.value} label={option.label} selected={filter === option.value} onPress={() => setFilter(option.value)} />
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {summary.items.length === 0 && (
          <Text className="px-6 py-8 text-center text-sm text-ct-muted">Nenhum lançamento encontrado.</Text>
        )}
        {summary.items.length > 0 && (
          <View className="flex-row items-baseline justify-between border-b border-t border-t-ct-ink border-b-ct-divider bg-ct-group-bg px-6 pb-[10px] pt-[14px]">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-ink">
              {formatMonthLong(year, month)}
            </Text>
            <Text style={{ fontFamily: FontFamily.mono }} className="text-[10px] text-ct-muted">
              {summary.total}
            </Text>
          </View>
        )}
        {summary.items.map((item) => (
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
                {item.metaLine}
              </Text>
            </View>
            <Text style={{ color: item.amountColor }} className="text-[15px] font-semibold">
              {item.amount}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
