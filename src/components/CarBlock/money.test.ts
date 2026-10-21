import { describe, expect, it } from "vitest";
import { divideMoney, formatMoney, isZeroMoney } from "./money";

describe("formatMoney", () => {
  it("drops decimals for whole amounts", () => {
    expect(formatMoney({ amount: "24.00", currency: "EUR" })).toBe("€24");
  });

  it("keeps two decimals otherwise", () => {
    expect(formatMoney({ amount: "132.34", currency: "EUR" })).toBe("€132.34");
  });
});

describe("divideMoney", () => {
  it("divides and rounds to two decimals", () => {
    expect(divideMoney({ amount: "132.34", currency: "EUR" }, 2)).toEqual({
      amount: "66.17",
      currency: "EUR",
    });
  });

  it("throws on a non-positive divisor", () => {
    expect(() => divideMoney({ amount: "10", currency: "EUR" }, 0)).toThrow(
      RangeError,
    );
  });
});

describe("isZeroMoney", () => {
  it("detects zero amounts", () => {
    expect(isZeroMoney({ amount: "0.00", currency: "EUR" })).toBe(true);
    expect(isZeroMoney({ amount: "0.40", currency: "EUR" })).toBe(false);
  });
});
