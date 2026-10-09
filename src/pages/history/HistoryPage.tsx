import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTags } from '@/entities/tag';
import { useDeleteTransactionsInRange, useTransactions } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { normalizeDateRange, todayAsIsoDate } from '@/shared/lib/date';
import { confirmDestructiveAction, showAlert } from '@/shared/lib/confirm';
import { takePendingPickedDate } from '@/shared/lib/date-picker-result';
import { useSelectedMonth } from '@/shared/lib/selected-month-context';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { FloatingNavContentClearance } from '@/shared/ui/NewTransactionFab';
import { PageLoader } from '@/shared/ui/PageLoader';
import { useToast } from '@/shared/ui/toast/ToastProvider';

import {
  buildDeleteMonthButtonLabel,
  buildDeleteMonthPrompt,
  buildDeletedTransactionsToast,
  buildHistorySummary,
  canDeleteMonth,
  type DateRange,
  filterTransactions,
  HistoryFilter,
  resolveHistoryPeriod,
} from './model/history-view';

const DeleteMonthErrorTitle = 'Não foi possível apagar';
const DeleteMonthErrorMessage = 'Tente novamente em instantes.';

type RangePickerStep = 'from' | 'to' | null;

const FilterOptions: { value: HistoryFilter; label: string }[] = [
  { value: HistoryFilter.All, label: 'tudo' },
  { value: HistoryFilter.Expenses, label: 'despesas' },
  { value: HistoryFilter.Income, label: 'receitas' },
  { value: HistoryFilter.Recurring, label: 'recorrentes' },
];

export function HistoryPage() {
  const router = useRouter();
  const { year, month, goToPreviousMonth, goToNextMonth } = useSelectedMonth();
  const { showToast } = useToast();

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>(HistoryFilter.All);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [pendingRangeFrom, setPendingRangeFrom] = useState<string | null>(null);

  // Picking a custom range takes two trips to the date picker (from, then to) -- this ref tracks
  // which leg is in flight across those trips, since it must survive the screen losing and
  // regaining focus without itself triggering a re-render.
  const rangePickerStepRef = useRef<RangePickerStep>(null);

  useFocusEffect(
    useCallback(() => {
      const step = rangePickerStepRef.current;
      if (step === null) {
        return;
      }

      const pickedDate = takePendingPickedDate();
      if (pickedDate === null) {
        rangePickerStepRef.current = null;
        return;
      }

      if (step === 'from') {
        rangePickerStepRef.current = 'to';
        setPendingRangeFrom(pickedDate);
        router.push({ pathname: '/pick-date', params: { initial: pickedDate } });
        return;
      }

      rangePickerStepRef.current = null;
      if (pendingRangeFrom !== null) {
        setCustomRange(normalizeDateRange(pendingRangeFrom, pickedDate));
      }
      setPendingRangeFrom(null);
    }, [pendingRangeFrom, router]),
  );

  function handlePressPickCustomRange() {
    rangePickerStepRef.current = 'from';
    router.push({ pathname: '/pick-date', params: { initial: todayAsIsoDate() } });
  }

  function handlePressExitCustomRange() {
    setCustomRange(null);
  }

  const { range, label: periodLabel } = resolveHistoryPeriod(customRange, year, month);

  const transactions = useTransactions({ from: range.from, to: range.to });
  const tags = useTags();
  const deleteTransactionsInRange = useDeleteTransactionsInRange();

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
  const monthTransactionCount = transactions.data.length;
  const isDeleteMonthVisible = canDeleteMonth(customRange, monthTransactionCount);
  const deleteMonthButtonLabel = buildDeleteMonthButtonLabel(deleteTransactionsInRange.isPending);

  function handlePressDeleteMonth() {
    const prompt = buildDeleteMonthPrompt(periodLabel, monthTransactionCount);
    confirmDestructiveAction(prompt.title, prompt.message, prompt.confirmLabel, deleteMonth);
  }

  function deleteMonth() {
    deleteTransactionsInRange.mutate(range, {
      onSuccess: (result) => showToast(buildDeletedTransactionsToast(result.deletedCount)),
      onError: () => showAlert(DeleteMonthErrorTitle, DeleteMonthErrorMessage),
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="gap-[18px] border-b border-ct-ink px-6 pb-4 pt-[26px]">
        <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
          histórico
        </Text>

        {customRange === null && (
          <View className="flex-row items-center justify-between border-y border-ct-ink py-[10px]">
            <Pressable onPress={goToPreviousMonth} hitSlop={12}>
              <Text className="text-lg text-ct-muted">‹</Text>
            </Pressable>
            <Text className="text-[15px] font-semibold tracking-wide text-ct-ink">{periodLabel}</Text>
            <Pressable onPress={goToNextMonth} hitSlop={12}>
              <Text className="text-lg text-ct-muted">›</Text>
            </Pressable>
          </View>
        )}

        {customRange !== null && (
          <View className="flex-row items-center justify-between border-y border-ct-ink py-[10px]">
            <Pressable onPress={handlePressExitCustomRange} hitSlop={12}>
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] uppercase text-ct-muted">
                ✕ período
              </Text>
            </Pressable>
            <Text className="text-[15px] font-semibold tracking-wide text-ct-ink">{periodLabel}</Text>
            <Pressable onPress={handlePressPickCustomRange} hitSlop={12}>
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.4 }} className="text-[10px] uppercase text-ct-muted">
                editar
              </Text>
            </Pressable>
          </View>
        )}

        {customRange === null && (
          <View className="flex-row items-center justify-between">
            <Pressable onPress={handlePressPickCustomRange} hitSlop={8}>
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.6 }} className="text-[10px] uppercase text-ct-muted">
                período customizado ›
              </Text>
            </Pressable>
            {isDeleteMonthVisible && (
              <Animated.View entering={FadeIn} exiting={FadeOut}>
                <Pressable onPress={handlePressDeleteMonth} disabled={deleteTransactionsInRange.isPending} hitSlop={8}>
                  <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.6 }} className="text-[10px] uppercase text-ct-danger">
                    {deleteMonthButtonLabel}
                  </Text>
                </Pressable>
              </Animated.View>
            )}
          </View>
        )}

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

      <ScrollView contentContainerStyle={{ paddingBottom: FloatingNavContentClearance }} showsVerticalScrollIndicator={false}>
        {summary.items.length === 0 && (
          <Text className="px-6 py-8 text-center text-sm text-ct-muted">Nenhum lançamento encontrado.</Text>
        )}
        {summary.items.length > 0 && (
          <View className="flex-row items-baseline justify-between border-b border-t border-t-ct-ink border-b-ct-divider bg-ct-group-bg px-6 pb-[10px] pt-[14px]">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-ink">
              {periodLabel}
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
