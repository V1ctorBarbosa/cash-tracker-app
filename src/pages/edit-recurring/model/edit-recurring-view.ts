const DayOfMonthOptions = [1, 5, 10, 15, 20, 25, 28] as const;

export type DayPill = { day: number; label: string; isSelected: boolean };

export function buildDayPills(selectedDay: number): DayPill[] {
  return DayOfMonthOptions.map((day) => ({ day, label: day.toString(), isSelected: day === selectedDay }));
}

/** "01/2026" -> "2026-01-01", or null when the input isn't a MM/AAAA month. */
export function parseMonthYearInput(rawMonthYear: string): string | null {
  const match = /^(\d{2})\/(\d{4})$/.exec(rawMonthYear.trim());
  if (match === null) {
    return null;
  }

  const [, month, year] = match;
  const monthNumber = Number(month);
  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return `${year}-${month}-01`;
}

/** "2026-01-01" -> "01/2026" */
export function formatMonthYearInput(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  return `${month}/${year}`;
}
