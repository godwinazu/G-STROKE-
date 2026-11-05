export const displayCurrency = process.env.NEXT_PUBLIC_CURRENCY || process.env.PAYSTACK_CURRENCY || 'USD';

export function formatMoney(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: displayCurrency,
    maximumFractionDigits: 2,
  }).format(amount);
}