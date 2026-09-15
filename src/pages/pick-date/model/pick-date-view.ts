import { formatMonthShort, toIsoDate } from '@/shared/lib/date';

export const WeekdayLabels = ['d', 's', 't', 'q', 'q', 's', 's'];

export type CalendarCell = {
  key: string;
  label: string;
  iso: string | null;
  isSelectable: boolean;
  isSelected: boolean;
  isToday: boolean;
};

/**
 * The 7-column grid for (year, month): leading blank cells so day 1 lands under its real
 * weekday, then one cell per day. A transaction records when money actually moved, so a day
 * after today hasn't happened yet -- those cells come back non-selectable.
 */
export function buildCalendarCells(year: number, month: number, selectedIso: string, todayIso: string): CalendarCell[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const cells: CalendarCell[] = [];
  for (let placeholderIndex = 0; placeholderIndex < firstWeekday; placeholderIndex++) {
    cells.push({ key: `blank-${placeholderIndex}`, label: '', iso: null, isSelectable: false, isSelected: false, isToday: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toIsoDate(year, month, day);
    cells.push({
      key: iso,
      label: String(day),
      iso,
      isSelectable: iso <= todayIso,
      isSelected: iso === selectedIso,
      isToday: iso === todayIso,
    });
  }

  return cells;
}

/** Never lets the picker browse into a month that's entirely in the future. */
export function canGoToNextMonth(year: number, month: number, todayIso: string): boolean {
  const [todayYear, todayMonth] = todayIso.split('-').map(Number);
  return year * 12 + month < todayYear * 12 + todayMonth;
}

/** "2026-09-10" -> "10 set 2026" */
export function formatSelectedDateLabel(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return `${day} ${formatMonthShort(year, month)}`;
}

/** Yesterday's date as "yyyy-MM-dd", relative to the given "yyyy-MM-dd" reference. */
export function yesterdayOf(todayIso: string): string {
  const [year, month, day] = todayIso.split('-').map(Number);
  const yesterday = new Date(year, month - 1, day - 1);
  return toIsoDate(yesterday.getFullYear(), yesterday.getMonth() + 1, yesterday.getDate());
}

/** The first day of the month containing the given "yyyy-MM-dd" reference. */
export function firstDayOfMonthOf(todayIso: string): string {
  const [year, month] = todayIso.split('-').map(Number);
  return toIsoDate(year, month, 1);
}
