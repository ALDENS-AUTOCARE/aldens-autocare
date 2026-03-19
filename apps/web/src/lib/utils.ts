export function formatCurrency(amount: number, currency = "GHS") {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

