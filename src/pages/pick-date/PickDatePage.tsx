import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontFamily } from '@/constants/theme';
import { formatMonthShort, todayAsIsoDate } from '@/shared/lib/date';
import { setPendingPickedDate } from '@/shared/lib/date-picker-result';

import {
  buildCalendarCells,
  canGoToNextMonth,
  firstDayOfMonthOf,
  formatSelectedDateLabel,
  WeekdayLabels,
  yesterdayOf,
  type CalendarCell,
} from './model/pick-date-view';

function CalendarDayCell({ cell, onPress }: { cell: CalendarCell; onPress: (iso: string) => void }) {
  if (cell.iso === null) {
    return <View className="h-11" />;
  }

  let backgroundColor = 'transparent';
  let textColor = Colors.light.ink;
  let borderColor = 'transparent';
  let fontWeight: 'normal' | '600' = 'normal';

  if (!cell.isSelectable) {
    textColor = Colors.light.navInactive;
  }
  if (cell.isToday) {
    borderColor = Colors.light.ink;
    fontWeight = '600';
  }
  if (cell.isSelected) {
    backgroundColor = Colors.light.ink;
    textColor = Colors.light.card;
    fontWeight = '600';
  }

  return (
    <Pressable
      onPress={() => onPress(cell.iso as string)}
      disabled={!cell.isSelectable}
      style={{ backgroundColor, borderWidth: 1, borderColor }}
      className="h-11 items-center justify-center">
      <Text style={{ fontFamily: FontFamily.mono, color: textColor, fontWeight }} className="text-sm">
        {cell.label}
      </Text>
    </Pressable>
  );
}

function QuickPickButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="flex-1 items-center border border-ct-ink py-[11px]">
      <Text className="text-[13px] font-medium text-ct-ink">{label}</Text>
    </Pressable>
  );
}

export function PickDatePage({ initialIso }: { initialIso: string }) {
  const router = useRouter();
  const todayIso = todayAsIsoDate();

  const [selectedIso, setSelectedIso] = useState(initialIso);
  const [displayedYear, setDisplayedYear] = useState(Number(initialIso.split('-')[0]));
  const [displayedMonth, setDisplayedMonth] = useState(Number(initialIso.split('-')[1]));

  const cells = buildCalendarCells(displayedYear, displayedMonth, selectedIso, todayIso);
  const canGoForward = canGoToNextMonth(displayedYear, displayedMonth, todayIso);

  function goToPreviousMonth() {
    if (displayedMonth === 1) {
      setDisplayedYear(displayedYear - 1);
      setDisplayedMonth(12);
      return;
    }

    setDisplayedMonth(displayedMonth - 1);
  }

  function goToNextMonth() {
    if (!canGoForward) {
      return;
    }

    if (displayedMonth === 12) {
      setDisplayedYear(displayedYear + 1);
      setDisplayedMonth(1);
      return;
    }

    setDisplayedMonth(displayedMonth + 1);
  }

  function selectQuickPick(iso: string) {
    setSelectedIso(iso);
    setDisplayedYear(Number(iso.split('-')[0]));
    setDisplayedMonth(Number(iso.split('-')[1]));
  }

  function handlePressUseThisDate() {
    setPendingPickedDate(selectedIso);
    router.back();
  }

  let nextMonthColor = Colors.light.muted;
  if (!canGoForward) {
    nextMonthColor = Colors.light.divider;
  }

  return (
    <SafeAreaView className="flex-1 bg-ct-paper">
      <View className="flex-row items-baseline justify-between px-6 pt-[26px]">
        <Text style={{ fontFamily: FontFamily.displayWordmark }} className="text-[15px] text-ct-ink">
          data
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text className="text-[15px] text-ct-muted">✕</Text>
        </Pressable>
      </View>

      <View className="px-6 pt-[26px]">
        <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 1.8 }} className="text-[10px] uppercase text-ct-muted">
          selecionada
        </Text>
        <Text className="mt-1 text-[30px] font-semibold tracking-tight text-ct-ink">{formatSelectedDateLabel(selectedIso)}</Text>
      </View>

      <View className="gap-4 px-6 pt-6">
        <View className="flex-row items-center justify-between border-y border-ct-ink py-[10px]">
          <Pressable onPress={goToPreviousMonth} hitSlop={12}>
            <Text className="text-lg text-ct-muted">‹</Text>
          </Pressable>
          <Text className="text-[15px] font-semibold">{formatMonthShort(displayedYear, displayedMonth)}</Text>
          <Pressable onPress={goToNextMonth} disabled={!canGoForward} hitSlop={12}>
            <Text style={{ color: nextMonthColor }} className="text-lg">
              ›
            </Text>
          </Pressable>
        </View>

        <View className="flex-row">
          {WeekdayLabels.map((label, index) => (
            <Text
              key={`weekday-${index}`}
              style={{ fontFamily: FontFamily.mono, letterSpacing: 1 }}
              className="flex-1 pb-1 text-center text-[10px] uppercase text-ct-muted">
              {label}
            </Text>
          ))}
        </View>
        <View className="flex-row flex-wrap">
          {cells.map((cell) => (
            <View key={cell.key} style={{ width: '14.2857%' }}>
              <CalendarDayCell cell={cell} onPress={setSelectedIso} />
            </View>
          ))}
        </View>

        <View className="flex-row justify-between">
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.6 }} className="text-[10px] text-ct-muted">
            contorno = hoje, {formatSelectedDateLabel(todayIso)}
          </Text>
          <Text style={{ fontFamily: FontFamily.mono, letterSpacing: 0.6 }} className="text-[10px] text-ct-muted">
            dias futuros em cinza
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2 px-6 pt-6">
        <QuickPickButton label="hoje" onPress={() => selectQuickPick(todayIso)} />
        <QuickPickButton label="ontem" onPress={() => selectQuickPick(yesterdayOf(todayIso))} />
        <QuickPickButton label="1º do mês" onPress={() => selectQuickPick(firstDayOfMonthOf(todayIso))} />
      </View>

      <View className="mt-auto flex-row gap-3 px-6 pb-6 pt-7">
        <Pressable onPress={() => router.back()} className="flex-1 items-center border border-ct-ink py-[15px]">
          <Text className="text-[15px] font-semibold text-ct-ink">cancelar</Text>
        </Pressable>
        <Pressable onPress={handlePressUseThisDate} className="flex-[1.4] items-center bg-ct-ink py-4">
          <Text className="text-[15px] font-semibold text-ct-card">usar esta data</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
