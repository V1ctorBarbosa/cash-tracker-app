import { buildDayPills, formatMonthYearInput, parseMonthYearInput } from './edit-recurring-view';

describe('buildDayPills', () => {
  test('marks the pill matching the selected day', () => {
    const pills = buildDayPills(10);

    expect(pills.find((pill) => pill.day === 10)?.isSelected).toBe(true);
    expect(pills.filter((pill) => pill.isSelected)).toHaveLength(1);
  });

  test('selects none when the current day is outside the fixed set', () => {
    const pills = buildDayPills(17);

    expect(pills.some((pill) => pill.isSelected)).toBe(false);
  });

  test('exposes the fixed day options in order', () => {
    const pills = buildDayPills(1);

    expect(pills.map((pill) => pill.label)).toEqual(['1', '5', '10', '15', '20', '25', '28']);
  });
});

describe('parseMonthYearInput', () => {
  test('parses a MM/AAAA month into an ISO date on the first day', () => {
    expect(parseMonthYearInput('01/2026')).toBe('2026-01-01');
  });

  test.each(['2026-01', '1/2026', '13/2026', '00/2026', 'not a month'])('returns null for an invalid input %p', (input) => {
    expect(parseMonthYearInput(input)).toBeNull();
  });
});

describe('formatMonthYearInput', () => {
  test('formats an ISO date as MM/AAAA', () => {
    expect(formatMonthYearInput('2026-01-01')).toBe('01/2026');
  });
});
