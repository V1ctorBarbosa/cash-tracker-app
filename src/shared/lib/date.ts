const MonthNamesLong = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const MonthNamesShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** (2026, 9) -> "setembro 2026" -- month is 1-indexed. */
export function formatMonthLong(year: number, month: number): string {
  return `${MonthNamesLong[month - 1]} ${year}`;
}

/** (2026, 9) -> "set 2026" -- month is 1-indexed. */
export function formatMonthShort(year: number, month: number): string {
  return `${MonthNamesShort[month - 1]} ${year}`;
}

/** The first and last calendar day of (year, month), as "yyyy-MM-dd" -- the shape the API's from/to query params expect. */
export function getMonthDateRange(year: number, month: number): { from: string; to: string } {
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  return { from: toIsoDate(year, month, 1), to: toIsoDate(year, month, lastDayOfMonth) };
}

/** The range spanning `monthsCount` months up to and including (year, month) -- e.g. (2026, 9, 6) covers abr-set 2026. */
export function getTrailingMonthsRange(year: number, month: number, monthsCount: number): { from: string; to: string } {
  const endOfRangeMonth = new Date(year, month, 0).getDate();
  const startDate = new Date(year, month - 1 - (monthsCount - 1), 1);
  return {
    from: toIsoDate(startDate.getFullYear(), startDate.getMonth() + 1, 1),
    to: toIsoDate(year, month, endOfRangeMonth),
  };
}

/** (2026, 9, 5) -> "2026-09-05" */
export function toIsoDate(year: number, month: number, day: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

/** (2026, 9) -> "2026-09" -- the shape the API's budget month path segment expects. */
export function toYearMonth(year: number, month: number): string {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
}

/** Today's date as "yyyy-MM-dd", in the device's local timezone. */
export function todayAsIsoDate(): string {
  const today = new Date();
  return toIsoDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
}

/** "2026-09-10" -> "10/09/2026" */
export function formatDateBR(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/** "2026-09-10T18:32:00Z" -> "10/09/2026 18:32" */
export function formatDateTimeBR(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()} ${hours}:${minutes}`;
}

/** { from: "2026-09-10", to: "2026-09-20" } -> "10/09/2026 – 20/09/2026" */
export function formatDateRangeBR(range: { from: string; to: string }): string {
  return `${formatDateBR(range.from)} – ${formatDateBR(range.to)}`;
}

/** Swaps from/to if they were picked out of order, so a backwards range still queries correctly. */
export function normalizeDateRange(from: string, to: string): { from: string; to: string } {
  if (from <= to) {
    return { from, to };
  }

  return { from: to, to: from };
}
