export function formatPrice(amount: number, currency = "SAR"): string {
  return `${currency} ${amount.toLocaleString("ar-SA")}`;
}