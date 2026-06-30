export function money(value: number | string | { toString(): string }, currency = "USD") {
  const amount = Number(value);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function percent(value: number | string | { toString(): string }) {
  return `${Number(value).toFixed(2)}%`;
}
