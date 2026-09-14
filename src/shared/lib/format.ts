const DecimalPlaces = 2;
const CentsPerReal = 100;

/** "5200" -> "5.200,00" -- pt-BR grouping/decimal separators, no currency symbol. */
export function formatAmount(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: DecimalPlaces, maximumFractionDigits: DecimalPlaces });
}

/** "5200" -> "R$ 5.200,00" */
export function formatCurrency(value: number): string {
  return `R$ ${formatAmount(value)}`;
}

/** "1.234,56" or "89,90" -> 1234.56, or null when the input isn't a positive number. */
export function parseAmountInput(rawAmount: string): number | null {
  const normalized = rawAmount.trim().replace(/\./g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * Reinterprets every digit currently in a money field as cents, right-aligned -- typing "2", "3",
 * "1" shows "0,02", then "0,23", then "2,31". Because the whole digit string is always the source
 * of truth, backspacing re-shifts correctly too (deleting the "1" reformats "23" back to "0,23").
 * Feed a TextInput's onChangeText value in; the result is display-ready pt-BR "1.234,56" text.
 */
export function maskCurrencyInput(rawInput: string): string {
  const digitsOnly = rawInput.replace(/\D/g, '');
  if (digitsOnly.length === 0) {
    return '';
  }

  const cents = Number(digitsOnly);
  return formatAmount(cents / CentsPerReal);
}
