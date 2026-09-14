const DecimalPlaces = 2;

/** "5200" -> "5.200,00" -- pt-BR grouping/decimal separators, no currency symbol. */
export function formatAmount(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: DecimalPlaces, maximumFractionDigits: DecimalPlaces });
}

/** "5200" -> "R$ 5.200,00" */
export function formatCurrency(value: number): string {
  return `R$ ${formatAmount(value)}`;
}
