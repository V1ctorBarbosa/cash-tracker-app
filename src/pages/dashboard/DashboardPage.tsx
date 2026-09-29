import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

import { useDashboard } from '@/entities/dashboard';
import { TransactionType } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { getMonthDateRange, getTrailingMonthsRange, formatMonthLong } from '@/shared/lib/date';
import { formatAmount, formatCurrency } from '@/shared/lib/format';
import { useSelectedMonth } from '@/shared/lib/selected-month-context';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { FloatingNavContentClearance } from '@/shared/ui/NewTransactionFab';
import { PageLoader } from '@/shared/ui/PageLoader';

import { buildCategoryDonut, buildMonthBars, buildPaymentMethodSegments, type CategoryDonut } from './model/dashboard-view';

const TrailingMonthsCount = 6;
const DonutDiameter = 132;
const DonutStrokeWidth = 27;
const DonutRadius = (DonutDiameter - DonutStrokeWidth) / 2;
const DonutCenter = DonutDiameter / 2;
const DonutCircumference = 2 * Math.PI * DonutRadius;
// Plain SVG transform syntax, not the `rotation`/`origin` convenience props -- react-native-svg's
// web shim mishandles those together on a Circle, emitting an invalid `transform-origin` DOM
// attribute (https://github.com/software-mansion/react-native-svg, WebShape.js). `transform`
// itself is a real SVG attribute and works consistently on both web and native.
const DonutStartRotationTransform = `rotate(-90, ${DonutCenter}, ${DonutCenter})`;

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{ fontFamily: FontFamily.mono, letterSpacing: 2 }}
      className="border-b border-ct-ink pb-2 text-[11px] uppercase text-ct-ink">
      {children}
    </Text>
  );
}

function CategoryDonutChart({ donut }: { donut: CategoryDonut }) {
  return (
    <View className="flex-row items-center gap-5">
      <View style={{ width: DonutDiameter, height: DonutDiameter }}>
        <Svg width={DonutDiameter} height={DonutDiameter}>
          <Circle cx={DonutCenter} cy={DonutCenter} r={DonutRadius} stroke={Colors.light.track} strokeWidth={DonutStrokeWidth} fill="none" />
          {donut.segments.map((segment) => {
            const segmentLength = segment.lengthFraction * DonutCircumference;
            return (
              <Circle
                key={segment.tagId}
                cx={DonutCenter}
                cy={DonutCenter}
                r={DonutRadius}
                stroke={segment.color}
                strokeWidth={DonutStrokeWidth}
                strokeDasharray={`${segmentLength}, ${DonutCircumference - segmentLength}`}
                strokeDashoffset={-segment.offsetFraction * DonutCircumference}
                fill="none"
                transform={DonutStartRotationTransform}
              />
            );
          })}
        </Svg>
        <View style={StyleSheet.absoluteFill} className="items-center justify-center">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1 }} className="text-[9px] uppercase text-ct-muted">
            total
          </Text>
          <Text className="text-sm font-semibold text-ct-ink">{donut.totalLabel}</Text>
        </View>
      </View>
      <View className="flex-1 gap-2">
        {donut.segments.map((segment) => (
          <View key={segment.tagId} className="flex-row items-center gap-2">
            <View className="h-[9px] w-[9px] rounded-full" style={{ backgroundColor: segment.color }} />
            <Text className="flex-1 text-[13px] text-ct-ink" numberOfLines={1}>
              {segment.name}
            </Text>
            <Text style={{ fontFamily: FontFamily.mono }} className="text-[11px] text-ct-muted">
              {segment.percentageLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const { year, month, goToPreviousMonth, goToNextMonth } = useSelectedMonth();

  const monthRange = getMonthDateRange(year, month);
  const trailingRange = getTrailingMonthsRange(year, month, TrailingMonthsCount);

  const monthDashboard = useDashboard(monthRange.from, monthRange.to);
  const trailingDashboard = useDashboard(trailingRange.from, trailingRange.to);

  function handlePressNewTransaction(type: TransactionType) {
    router.push({ pathname: '/(tabs)/new', params: { type } });
  }

  if (monthDashboard.isPending || trailingDashboard.isPending) {
    return <PageLoader />;
  }

  if (monthDashboard.isError || trailingDashboard.isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-ct-paper px-6">
        <ErrorMessage />
      </SafeAreaView>
    );
  }

  const dashboard = monthDashboard.data;
  const categoryDonut = buildCategoryDonut(dashboard.spendByTag);
  const paymentMethodSegments = buildPaymentMethodSegments(dashboard.spendByPaymentMethod);
  const monthBars = buildMonthBars(trailingDashboard.data.monthlySummary);

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <ScrollView contentContainerStyle={{ paddingBottom: FloatingNavContentClearance }} showsVerticalScrollIndicator={false}>
        <View className="gap-[22px] px-6 pb-[18px] pt-[26px]">
          <View className="flex-row items-baseline justify-between">
            <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
              cash track
            </Text>
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[11px] uppercase text-ct-muted">
              brl
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-y border-ct-ink py-[10px]">
            <Pressable onPress={goToPreviousMonth} hitSlop={12}>
              <Text className="text-lg text-ct-muted">‹</Text>
            </Pressable>
            <Text className="text-[15px] font-semibold tracking-wide text-ct-ink">{formatMonthLong(year, month)}</Text>
            <Pressable onPress={goToNextMonth} hitSlop={12}>
              <Text className="text-lg text-ct-muted">›</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-[14px] px-6">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-ct-card px-4 py-[14px]">
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
                receita
              </Text>
              <Text className="mt-[6px] text-[21px] font-semibold tracking-tight text-ct-ink">
                {formatAmount(dashboard.totalIncome)}
              </Text>
            </View>
            <View className="flex-1 bg-ct-card px-4 py-[14px]">
              <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
                despesa
              </Text>
              <Text className="mt-[6px] text-[21px] font-semibold tracking-tight text-ct-ink">
                {formatAmount(dashboard.totalExpense)}
              </Text>
            </View>
          </View>

          <View className="bg-ct-accent p-4">
            <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-card opacity-75">
              saldo do mês
            </Text>
            <Text style={{ fontFamily: FontFamily.bodyExtraBold }} className="mt-1 text-[36px] tracking-tight text-ct-card">
              {formatCurrency(dashboard.balance)}
            </Text>
          </View>
        </View>

        <View className="gap-[14px] px-6 pt-7">
          <SectionLabel>gasto por categoria</SectionLabel>
          {categoryDonut.segments.length === 0 && <Text className="text-sm text-ct-muted">Nenhuma despesa neste mês.</Text>}
          {categoryDonut.segments.length > 0 && <CategoryDonutChart donut={categoryDonut} />}
        </View>

        <View className="gap-[14px] px-6 pt-7">
          <SectionLabel>forma de pagamento</SectionLabel>
          {paymentMethodSegments.length > 0 && (
            <View className="h-10 flex-row overflow-hidden">
              {paymentMethodSegments.map((segment) => (
                <View key={segment.paymentMethod} style={{ width: `${segment.widthPct}%`, backgroundColor: segment.color }} />
              ))}
            </View>
          )}
          <View className="flex-row flex-wrap gap-x-4 gap-y-2">
            {paymentMethodSegments.map((segment) => (
              <View key={segment.paymentMethod} className="w-[46%] flex-row items-center gap-2">
                <View className="h-[10px] w-[10px]" style={{ backgroundColor: segment.color }} />
                <Text className="flex-1 text-xs text-ct-ink" numberOfLines={1}>
                  {segment.label}
                </Text>
                <Text style={{ fontFamily: FontFamily.mono }} className="text-[11px] text-ct-muted">
                  {segment.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-[14px] px-6 pt-7">
          <SectionLabel>últimos meses</SectionLabel>
          <View className="h-[130px] flex-row items-end gap-[14px]">
            {monthBars.map((bar) => (
              <View key={bar.month} className="flex-1 items-center gap-[7px]">
                <View className="h-[104px] w-full flex-row items-end gap-[3px]">
                  <View className="flex-1 bg-ct-accent" style={{ height: `${bar.incomeHeightPct}%` }} />
                  <View className="flex-1 bg-[#b9b3a1]" style={{ height: `${bar.expenseHeightPct}%` }} />
                </View>
                <Text style={{ fontFamily: FontFamily.mono }} className="text-[10px] text-ct-muted">
                  {bar.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3 p-6">
          <Pressable onPress={() => handlePressNewTransaction(TransactionType.Income)} className="flex-1 items-center bg-ct-ink py-[15px]">
            <Text className="text-sm font-semibold text-ct-card">+ receita</Text>
          </Pressable>
          <Pressable
            onPress={() => handlePressNewTransaction(TransactionType.Expense)}
            className="flex-1 items-center border border-ct-ink py-[14px]">
            <Text className="text-sm font-semibold text-ct-ink">+ despesa</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
