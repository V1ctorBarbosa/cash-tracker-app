/** "1.234,56" or "89,90" -> 1234.56, or null when the input isn't a positive number. */
export function parseAmountInput(rawAmount: string): number | null {
  const normalized = rawAmount.trim().replace(/\./g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** "10/09/2026" -> "2026-09-10", or null when the input isn't a valid calendar date. */
export function parseDateInput(rawDate: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(rawDate.trim());
  if (match === null) {
    return null;
  }

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const parsed = new Date(`${isoDate}T00:00:00`);
  const isRealCalendarDate =
    parsed.getFullYear() === Number(year) && parsed.getMonth() + 1 === Number(month) && parsed.getDate() === Number(day);

  return isRealCalendarDate ? isoDate : null;
}

/** Today's date as "DD/MM/AAAA", matching the field's display format. */
export function todayAsBRDate(): string {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}/${today.getFullYear()}`;
}
