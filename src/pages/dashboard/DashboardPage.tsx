import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useDashboard } from '@/entities/dashboard';
import { TransactionType } from '@/entities/transaction';
import { Colors, FontFamily } from '@/constants/theme';
import { getMonthDateRange, getTrailingMonthsRange, formatMonthLong } from '@/shared/lib/date';
import { useFillHeight, useFillWidth } from '@/shared/lib/use-fill-animation';
import { formatAmount, formatCurrency } from '@/shared/lib/format';
import { StandardEasing } from '@/shared/lib/motion';
import { useSelectedMonth } from '@/shared/lib/selected-month-context';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { FloatingNavContentClearance } from '@/shared/ui/NewTransactionFab';
import { PageLoader } from '@/shared/ui/PageLoader';
import { Reveal } from '@/shared/ui/Reveal';

import {
  buildCategoryDonut,
  buildMonthBars,
  buildPaymentMethodSegments,
  type CategoryDonut,
  type MonthBar,
  type PaymentMethodSegment,
} from './model/dashboard-view';

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

/** How close to the bottom of the viewport a section's top edge must be before it counts as "visible enough to reveal". */
const RevealMarginPx = 40;
const CompactHeaderScrollThreshold = 250;
const CompactHeaderHeight = 52;
const CompactHeaderOpacityDuration = 260;
const CompactHeaderTransformDuration = 320;
const PaymentSegmentFillDuration = 900;
const MonthBarFillDuration = 800;
const MonthBarStaggerMs = 60;

type RevealKey = 'cat' | 'pay' | 'hist' | 'btn';
const InitialRevealState: Record<RevealKey, boolean> = { cat: false, pay: false, hist: false, btn: false };

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      style={{ fontFamily: FontFamily.mono, letterSpacing: 2 }}
      className="border-b border-ct-ink pb-2 text-[11px] uppercase text-ct-ink">
      {children}
    </Text>
  );
}

function CompactHeader({ visible, monthLabel, balanceLabel }: { visible: boolean; monthLabel: string; balanceLabel: string }) {
  const animatedStyle = useAnimatedStyle(() => {
    let targetOpacity = 0;
    if (visible) {
      targetOpacity = 1;
    }

    let targetY = -CompactHeaderHeight;
    if (visible) {
      targetY = 0;
    }

    return {
      opacity: withTiming(targetOpacity, { duration: CompactHeaderOpacityDuration }),
      transform: [{ translateY: withTiming(targetY, { duration: CompactHeaderTransformDuration, easing: StandardEasing }) }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[animatedStyle, { height: CompactHeaderHeight, zIndex: 10 }]}
      className="absolute left-0 right-0 top-0 flex-row items-baseline justify-between border-b border-ct-ink bg-ct-paper px-6">
      <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.4 }} className="text-[11px] uppercase text-ct-muted">
        {monthLabel}
      </Text>
      <Text className="text-[17px] font-bold tracking-tight text-ct-ink">{balanceLabel}</Text>
    </Animated.View>
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

function AnimatedPaymentSegment({ segment, revealed }: { segment: PaymentMethodSegment; revealed: boolean }) {
  const animatedStyle = useFillWidth(segment.widthPct, revealed, 0, PaymentSegmentFillDuration);

  return <Animated.View style={[animatedStyle, { backgroundColor: segment.color }]} />;
}

function AnimatedMonthColumn({ bar, index, revealed }: { bar: MonthBar; index: number; revealed: boolean }) {
  const delayMs = index * MonthBarStaggerMs;
  const incomeStyle = useFillHeight(bar.incomeHeightPct, revealed, delayMs, MonthBarFillDuration);
  const expenseStyle = useFillHeight(bar.expenseHeightPct, revealed, delayMs, MonthBarFillDuration);

  return (
    <View className="flex-1 items-center gap-[7px]">
      <View className="h-[104px] w-full flex-row items-end gap-[3px]">
        <Animated.View className="flex-1 bg-ct-accent" style={incomeStyle} />
        <Animated.View className="flex-1 bg-[#b9b3a1]" style={expenseStyle} />
      </View>
      <Text style={{ fontFamily: FontFamily.mono }} className="text-[10px] text-ct-muted">
        {bar.label}
      </Text>
    </View>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const { year, month, goToPreviousMonth, goToNextMonth } = useSelectedMonth();

  const [revealed, setRevealed] = useState(InitialRevealState);
  const [isCompact, setIsCompact] = useState(false);
  const sectionYRef = useRef<Partial<Record<RevealKey, number>>>({});
  const scrollStateRef = useRef({ scrollY: 0, viewportHeight: 0 });

  const monthRange = getMonthDateRange(year, month);
  const trailingRange = getTrailingMonthsRange(year, month, TrailingMonthsCount);

  const monthDashboard = useDashboard(monthRange.from, monthRange.to);
  const trailingDashboard = useDashboard(trailingRange.from, trailingRange.to);

  function handlePressNewTransaction(type: TransactionType) {
    router.push({ pathname: '/(tabs)/new', params: { type } });
  }

  // Re-run from every layout/scroll event, not just onScroll -- a section's own onLayout can fire
  // before or after the ScrollView's, and on a tall enough screen everything may already fit
  // without the user ever scrolling, so the check can't only live in one of the two handlers.
  function checkReveal() {
    const { scrollY, viewportHeight } = scrollStateRef.current;
    const revealLine = scrollY + viewportHeight - RevealMarginPx;

    setRevealed((current) => {
      let changed = false;
      const next = { ...current };
      for (const key of Object.keys(sectionYRef.current) as RevealKey[]) {
        const sectionY = sectionYRef.current[key];
        if (sectionY !== undefined && !next[key] && sectionY < revealLine) {
          next[key] = true;
          changed = true;
        }
      }

      if (!changed) {
        return current;
      }

      return next;
    });
    setIsCompact(scrollY > CompactHeaderScrollThreshold);
  }

  function registerSectionLayout(key: RevealKey, event: LayoutChangeEvent) {
    sectionYRef.current[key] = event.nativeEvent.layout.y;
    checkReveal();
  }

  function handleCategorySectionLayout(event: LayoutChangeEvent) {
    registerSectionLayout('cat', event);
  }

  function handlePaymentSectionLayout(event: LayoutChangeEvent) {
    registerSectionLayout('pay', event);
  }

  function handleHistorySectionLayout(event: LayoutChangeEvent) {
    registerSectionLayout('hist', event);
  }

  function handleButtonsSectionLayout(event: LayoutChangeEvent) {
    registerSectionLayout('btn', event);
  }

  function handleScrollViewLayout(event: LayoutChangeEvent) {
    scrollStateRef.current.viewportHeight = event.nativeEvent.layout.height;
    checkReveal();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollStateRef.current = {
      scrollY: event.nativeEvent.contentOffset.y,
      viewportHeight: event.nativeEvent.layoutMeasurement.height,
    };
    checkReveal();
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
      <CompactHeader visible={isCompact} monthLabel={formatMonthLong(year, month)} balanceLabel={formatCurrency(dashboard.balance)} />
      <Animated.ScrollView
        onLayout={handleScrollViewLayout}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingBottom: FloatingNavContentClearance }}
        showsVerticalScrollIndicator={false}>
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

        <View onLayout={handleCategorySectionLayout} className="gap-[14px] px-6 pt-7">
          <SectionLabel>gasto por categoria</SectionLabel>
          {categoryDonut.segments.length === 0 && <Text className="text-sm text-ct-muted">Nenhuma despesa neste mês.</Text>}
          {categoryDonut.segments.length > 0 && (
            <Reveal revealed={revealed.cat}>
              <CategoryDonutChart donut={categoryDonut} />
            </Reveal>
          )}
        </View>

        <View onLayout={handlePaymentSectionLayout} className="gap-[14px] px-6 pt-7">
          <SectionLabel>forma de pagamento</SectionLabel>
          {paymentMethodSegments.length > 0 && (
            <View className="h-10 flex-row overflow-hidden">
              {paymentMethodSegments.map((segment) => (
                <AnimatedPaymentSegment key={segment.paymentMethod} segment={segment} revealed={revealed.pay} />
              ))}
            </View>
          )}
          <Reveal revealed={revealed.pay}>
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
          </Reveal>
        </View>

        <View onLayout={handleHistorySectionLayout} className="gap-[14px] px-6 pt-7">
          <SectionLabel>últimos meses</SectionLabel>
          <View className="h-[130px] flex-row items-end gap-[14px]">
            {monthBars.map((bar, index) => (
              <AnimatedMonthColumn key={bar.month} bar={bar} index={index} revealed={revealed.hist} />
            ))}
          </View>
        </View>

        <View onLayout={handleButtonsSectionLayout} className="p-6">
          <Reveal revealed={revealed.btn}>
            <View className="flex-row gap-3">
              <Pressable onPress={() => handlePressNewTransaction(TransactionType.Income)} className="flex-1 items-center bg-ct-ink py-[15px]">
                <Text className="text-sm font-semibold text-ct-card">+ receita</Text>
              </Pressable>
              <Pressable
                onPress={() => handlePressNewTransaction(TransactionType.Expense)}
                className="flex-1 items-center border border-ct-ink py-[14px]">
                <Text className="text-sm font-semibold text-ct-ink">+ despesa</Text>
              </Pressable>
            </View>
          </Reveal>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
