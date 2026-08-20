/**
 * Currency is fixed to Colombian Pesos and always formatted with the
 * es-CO locale (e.g. "$ 123.456"), independent of the interface language
 * toggle — that toggle only changes UI text, not the money format.
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Distance/volume numbers respect the active UI locale for grouping. */
export function formatNumber(n: number, locale: string, digits = 2): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}
