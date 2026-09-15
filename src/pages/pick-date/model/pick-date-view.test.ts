import { buildCalendarCells, canGoToNextMonth, firstDayOfMonthOf, formatSelectedDateLabel, yesterdayOf } from './pick-date-view';

describe('buildCalendarCells', () => {
  test('pads leading blank cells so day 1 lands under its real weekday', () => {
    // 2026-09-01 is a Tuesday (weekday index 2)
    const cells = buildCalendarCells(2026, 9, '2026-09-10', '2026-09-15');

    expect(cells.slice(0, 2).every((cell) => cell.iso === null)).toBe(true);
    expect(cells[2]).toMatchObject({ label: '1', iso: '2026-09-01' });
  });

  test('produces exactly one cell per day in the month', () => {
    const cells = buildCalendarCells(2026, 9, '2026-09-10', '2026-09-15');

    const dayCells = cells.filter((cell) => cell.iso !== null);
    expect(dayCells).toHaveLength(30);
  });

  test('marks the selected day', () => {
    const cells = buildCalendarCells(2026, 9, '2026-09-10', '2026-09-15');

    const selected = cells.find((cell) => cell.iso === '2026-09-10');
    expect(selected?.isSelected).toBe(true);
    expect(cells.filter((cell) => cell.isSelected)).toHaveLength(1);
  });

  test('marks today', () => {
    const cells = buildCalendarCells(2026, 9, '2026-09-10', '2026-09-15');

    const today = cells.find((cell) => cell.iso === '2026-09-15');
    expect(today?.isToday).toBe(true);
  });

  test('marks days after today as not selectable, and today/earlier as selectable', () => {
    const cells = buildCalendarCells(2026, 9, '2026-09-10', '2026-09-15');

    const dayCells = cells.filter((cell) => cell.iso !== null);
    expect(dayCells.find((cell) => cell.iso === '2026-09-15')?.isSelectable).toBe(true);
    expect(dayCells.find((cell) => cell.iso === '2026-09-16')?.isSelectable).toBe(false);
    expect(dayCells.find((cell) => cell.iso === '2026-09-30')?.isSelectable).toBe(false);
  });
});

describe('canGoToNextMonth', () => {
  test('allows moving forward while still before the month containing today', () => {
    expect(canGoToNextMonth(2026, 8, '2026-09-15')).toBe(true);
  });

  test('refuses to move forward once viewing the month containing today', () => {
    expect(canGoToNextMonth(2026, 9, '2026-09-15')).toBe(false);
  });

  test('refuses to move forward past today across a year boundary', () => {
    expect(canGoToNextMonth(2025, 12, '2026-01-15')).toBe(true);
    expect(canGoToNextMonth(2026, 1, '2026-01-15')).toBe(false);
  });
});

describe('formatSelectedDateLabel', () => {
  test('formats as "day month year"', () => {
    expect(formatSelectedDateLabel('2026-09-10')).toBe('10 set 2026');
  });
});

describe('yesterdayOf', () => {
  test('steps back one day', () => {
    expect(yesterdayOf('2026-09-15')).toBe('2026-09-14');
  });

  test('rolls back across a month boundary', () => {
    expect(yesterdayOf('2026-09-01')).toBe('2026-08-31');
  });

  test('rolls back across a year boundary', () => {
    expect(yesterdayOf('2026-01-01')).toBe('2025-12-31');
  });
});

describe('firstDayOfMonthOf', () => {
  test('returns the first day of the reference date\'s month', () => {
    expect(firstDayOfMonthOf('2026-09-15')).toBe('2026-09-01');
  });
});
