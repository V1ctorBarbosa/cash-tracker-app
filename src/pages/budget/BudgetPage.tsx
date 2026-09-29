import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { useDashboard } from '@/entities/dashboard';
import { FontFamily } from '@/constants/theme';
import { getMonthDateRange, formatMonthShort } from '@/shared/lib/date';
import { useFillWidth } from '@/shared/lib/use-fill-animation';
import { useSelectedMonth } from '@/shared/lib/selected-month-context';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { FloatingNavContentClearance } from '@/shared/ui/NewTransactionFab';
import { PageLoader } from '@/shared/ui/PageLoader';

import { buildBudgetBars, buildTotals, type BudgetBar } from './model/budget-view';

const BudgetBarFillDuration = 900;
const BudgetBarStaggerMs = 90;

// No scroll/mount gating needed here (unlike the dashboard's sections) -- the fill hook's own
// effect already fires once on mount, so passing a constant `true` is enough to get "grows in with
// a stagger as soon as the page appears" without a redundant local "revealed" state.
function AnimatedBudgetBar({ budget, index }: { budget: BudgetBar; index: number }) {
  const fillStyle = useFillWidth(budget.pct, true, index * BudgetBarStaggerMs, BudgetBarFillDuration);

  return (
    <View key={budget.tagId} className="gap-[9px]">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-base font-semibold tracking-tight text-ct-ink">{budget.name}</Text>
        <Text style={{ fontFamily: FontFamily.mono, color: budget.noteColor }} className="text-xs">
          {budget.note}
        </Text>
      </View>
      <View className="gap-[3px]">
        <View className="h-[13px] bg-ct-track" />
        <View className="h-[13px] bg-ct-track">
          <Animated.View className="h-[13px]" style={[fillStyle, { backgroundColor: budget.color }]} />
        </View>
      </View>
      <View className="flex-row justify-between">
        <Text style={{ fontFamily: FontFamily.mono }} className="text-[11px] text-ct-muted">
          real {budget.actual}
        </Text>
        <Text style={{ fontFamily: FontFamily.mono }} className="text-[11px] text-ct-muted">
          limite {budget.limit}
        </Text>
      </View>
    </View>
  );
}

export function BudgetPage() {
  const router = useRouter();
  const { year, month } = useSelectedMonth();
  const range = getMonthDateRange(year, month);
  const dashboard = useDashboard(range.from, range.to);

  if (dashboard.isPending) {
    return <PageLoader />;
  }

  if (dashboard.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const budgetBars = buildBudgetBars(dashboard.data.budgets);
  const totals = buildTotals(dashboard.data.budgets, dashboard.data.totalExpense);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerStyle={{ paddingBottom: FloatingNavContentClearance }} showsVerticalScrollIndicator={false}>
        <View className="gap-[18px] px-6 pb-[18px] pt-[26px]">
          <View className="flex-row items-baseline justify-between">
            <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
              orçamentos
            </Text>
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[11px] uppercase text-ct-muted">
              {formatMonthShort(year, month)}
            </Text>
          </View>

          <View className="flex-row items-baseline justify-between border-y border-ct-ink py-3">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
              limite total
            </Text>
            <Text className="text-[15px] font-semibold text-ct-ink">
              {totals.totalLimit} · usado {totals.used}
            </Text>
          </View>
        </View>

        <View className="gap-[26px] px-6">
          {budgetBars.length === 0 && <Text className="text-sm text-ct-muted">Nenhum orçamento definido para este mês.</Text>}
          {budgetBars.map((budget, index) => (
            <AnimatedBudgetBar key={budget.tagId} budget={budget} index={index} />
          ))}
        </View>

        <View className="px-6 pb-6 pt-7">
          <Pressable
            onPress={() => router.push({ pathname: '/budget/new-limit', params: { year: year.toString(), month: month.toString() } })}
            className="items-center border border-ct-ink py-[14px]">
            <Text className="text-sm font-semibold text-ct-ink">definir novo limite</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
