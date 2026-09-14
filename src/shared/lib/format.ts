const DecimalPlaces = 2;

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
