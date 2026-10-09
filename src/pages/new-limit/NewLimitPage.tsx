import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDashboard } from '@/entities/dashboard';
import { useUpsertBudget } from '@/entities/budget';
import { useTags } from '@/entities/tag';
import { Colors, FontFamily } from '@/constants/theme';
import { getTrailingMonthsRange, toYearMonth } from '@/shared/lib/date';
import { formatAmount, maskCurrencyInput, parseAmountInput } from '@/shared/lib/format';
import { Chip } from '@/shared/ui/Chip';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { PageLoader } from '@/shared/ui/PageLoader';

import {
  buildExpenseTags,
  buildMonthOptions,
  computeAveragePct,
  computeTrailingMonthlyAverage,
  TrailingMonthsForAverage,
} from './model/new-limit-view';

function MonthPillButton({ label, isSelected, onPress }: { label: string; isSelected: boolean; onPress: () => void }) {
  let backgroundColor: string;
  let textColor: string;
  if (isSelected) {
    backgroundColor = Colors.light.ink;
    textColor = Colors.light.card;
  } else {
    backgroundColor = 'transparent';
    textColor = Colors.light.ink;
  }

  return (
    <Pressable onPress={onPress} style={{ backgroundColor }} className="flex-1 items-center border border-ct-ink py-[11px]">
      <Text style={{ color: textColor }} className="text-[13px] font-medium">
        {label}
      </Text>
    </Pressable>
  );
}

export function NewLimitPage({ initialYear, initialMonth }: { initialYear: number; initialMonth: number }) {
  const router = useRouter();
  const tags = useTags();
  const upsertBudget = useUpsertBudget();

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(1);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const monthOptions = buildMonthOptions(initialYear, initialMonth);
  const selectedMonth = monthOptions[selectedMonthIndex];
  const trailingRange = getTrailingMonthsRange(selectedMonth.year, selectedMonth.month, TrailingMonthsForAverage);
  const dashboard = useDashboard({ from: trailingRange.from, to: trailingRange.to });

  if (tags.isPending || dashboard.isPending) {
    return <PageLoader />;
  }

  if (tags.isError || dashboard.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const expenseTags = buildExpenseTags(tags.data);
  const limitAmount = parseAmountInput(limitInput) ?? 0;

  let trailingAverage = 0;
  if (selectedTagId !== null) {
    trailingAverage = computeTrailingMonthlyAverage(dashboard.data.spendByTag, selectedTagId);
  }

  const averagePct = computeAveragePct(trailingAverage, limitAmount);
  const isSaving = upsertBudget.isPending;

  async function handlePressSave() {
    setErrorMessage(null);

    const parsedLimit = parseAmountInput(limitInput);

    if (selectedTagId === null) {
      setErrorMessage('Escolha uma categoria.');
      return;
    }
    if (parsedLimit === null) {
      setErrorMessage('Informe um limite válido.');
      return;
    }

    try {
      await upsertBudget.mutateAsync({ tagId: selectedTagId, month: toYearMonth(selectedMonth.year, selectedMonth.month), limitAmount: parsedLimit });
      router.back();
    } catch {
      setErrorMessage('Não foi possível salvar. Tente novamente.');
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-baseline justify-between px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
            novo limite
          </Text>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text className="text-[15px] text-ct-muted">✕</Text>
          </Pressable>
        </View>

        <View className="gap-3 px-6 pt-7">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            categoria
          </Text>
          {expenseTags.length === 0 && <Text className="text-xs text-ct-muted">Nenhuma categoria de despesa ainda.</Text>}
          <View className="flex-row flex-wrap gap-2">
            {expenseTags.map((tag) => (
              <Chip key={tag.id} label={tag.name} selected={selectedTagId === tag.id} onPress={() => setSelectedTagId(tag.id)} />
            ))}
          </View>
        </View>

        <View className="gap-3 px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            mês
          </Text>
          <View className="flex-row gap-2">
            {monthOptions.map((option, index) => (
              <MonthPillButton key={option.label} label={option.label} isSelected={index === selectedMonthIndex} onPress={() => setSelectedMonthIndex(index)} />
            ))}
          </View>
        </View>

        <View className="gap-[10px] px-6 pt-[26px]">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
            limite mensal
          </Text>
          <View className="flex-row items-baseline gap-2 border-b border-ct-ink pb-[10px]">
            <Text className="text-xl text-ct-muted">R$</Text>
            <TextInput
              value={limitInput}
              onChangeText={(text) => setLimitInput(maskCurrencyInput(text))}
              placeholder="0,00"
              placeholderTextColor={Colors.light.divider}
              keyboardType="decimal-pad"
              style={{ fontFamily: FontFamily.bodyBold }}
              className="flex-1 text-[44px] tracking-tight text-ct-ink"
            />
          </View>
        </View>

        {selectedTagId !== null && (
          <View className="px-6 pt-[26px]">
            <View className="gap-[10px] bg-ct-card p-[18px]">
              <View className="flex-row items-baseline justify-between">
                <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[10px] uppercase text-ct-muted">
                  média dos 3 últimos meses
                </Text>
                <Text className="text-sm font-semibold text-ct-ink">{formatAmount(trailingAverage)}</Text>
              </View>
              <View className="h-[10px] bg-ct-track">
                <View className="h-[10px] bg-ct-accent" style={{ width: `${averagePct}%` }} />
              </View>
              <Text style={{ fontFamily: FontFamily.mono }} className="text-[10px] text-ct-muted">
                o limite atual substitui qualquer valor já definido para {selectedMonth.label}
              </Text>
            </View>
          </View>
        )}

        {errorMessage !== null && (
          <View className="px-6 pt-6">
            <ErrorMessage message={errorMessage} />
          </View>
        )}

        <View className="px-6 pb-6 pt-7">
          <Pressable onPress={handlePressSave} disabled={isSaving} className="items-center bg-ct-accent py-[17px] disabled:opacity-60">
            <Text className="text-[15px] font-semibold text-ct-card">salvar limite</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
