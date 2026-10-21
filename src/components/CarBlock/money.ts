import type { Money } from "@/types/carRental";

/** The only place that turns `Money.amount` into a number. */
function toNumber(money: Money): number {
  return Number(money.amount);
}

/** Formats money as currency: whole amounts without decimals (`€24`), others with two (`€132.34`). */
export function formatMoney(money: Money, locale = "en-IE"): string {
  const value = toNumber(money);
  const digits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Divides money by a positive divisor, keeping two decimals. */
export function divideMoney(money: Money, divisor: number): Money {
  if (!(divisor > 0)) {
    throw new RangeError("divisor must be greater than 0");
  }
  return {
    amount: (toNumber(money) / divisor).toFixed(2),
    currency: money.currency,
  };
}

export function isZeroMoney(money: Money): boolean {
  return toNumber(money) === 0;
}
