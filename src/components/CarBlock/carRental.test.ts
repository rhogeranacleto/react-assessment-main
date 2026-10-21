import { describe, expect, it } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import type { RentalRate } from "@/types/carRental";
import {
  formatCount,
  formatFuelPolicy,
  formatLocationName,
  formatMileage,
  formatPickupType,
  formatVehicleName,
  getCancellation,
  getIncludedCoverLabel,
  getRatingTone,
  selectRate,
} from "./carRental";

const [bmw] = searchResponse.cars;
const yaris = searchResponse.cars[3];
const rate = bmw.rentalRates[0];
const location = searchResponse.locations["203367"];

function withRelevance(orderByRelevance: number): RentalRate {
  return { ...rate, config: { ...rate.config, orderByRelevance } };
}

describe("selectRate", () => {
  it("returns the only rate", () => {
    expect(selectRate([rate])).toBe(rate);
  });

  it("picks the lowest relevance", () => {
    const rates = [2, 0, 1].map(withRelevance);
    expect(selectRate(rates)).toBe(rates[1]);
  });

  it("keeps the first on ties", () => {
    const rates = [0, 0].map(withRelevance);
    expect(selectRate(rates)).toBe(rates[0]);
  });

  it("returns undefined for no rates", () => {
    expect(selectRate([])).toBeUndefined();
  });
});

describe("getCancellation", () => {
  const policy = rate.pricing.cancellationPolicy!;
  const withPolicy = (p: typeof policy | undefined): RentalRate => ({
    ...rate,
    pricing: { ...rate.pricing, cancellationPolicy: p },
  });

  it("returns the fee", () => {
    expect(getCancellation(rate)).toEqual({
      kind: "fee",
      fee: { amount: "180.93", currency: "EUR" },
    });
  });

  it("is free for a zero fee", () => {
    const zero = { ...policy, fee: { amount: "0.00", currency: "EUR" } };
    expect(getCancellation(withPolicy(zero))).toEqual({ kind: "free" });
  });

  it("is free when the fee is removed", () => {
    expect(getCancellation(withPolicy({ ...policy, fee: undefined }))).toEqual({
      kind: "free",
    });
  });

  it("is undefined without a policy", () => {
    expect(getCancellation(withPolicy(undefined))).toBeUndefined();
  });
});

describe("formatters", () => {
  it("formats vehicle names", () => {
    expect(formatVehicleName(bmw.vehicle)).toBe("BMW X5 or similar");
    expect(formatVehicleName(yaris.vehicle)).toBe("Toyota Yaris or similar");
  });

  it("pluralises counts", () => {
    expect(formatCount(1, "bag", "bags")).toBe("1 bag");
    expect(formatCount(2, "bag", "bags")).toBe("2 bags");
    expect(formatCount(5, "seat", "seats")).toBe("5 seats");
    expect(formatCount(1, "seat", "seats")).toBe("1 seat");
  });

  it("formats fuel policy", () => {
    expect(formatFuelPolicy("FULLFULL")).toBe("Fuel policy: Full to full");
    expect(formatFuelPolicy("OTHER")).toBe("Fuel policy: OTHER");
  });

  it("formats mileage", () => {
    expect(formatMileage(rate.mileagePolicy!)).toBe("Mileage: 200 km/day");
    expect(formatMileage({ ...rate.mileagePolicy!, quantity: undefined })).toBe(
      "Mileage: Unlimited",
    );
    expect(
      formatMileage({
        description: "Unlimited mileage",
        taxInclusive: true,
        includedInRate: true,
      }),
    ).toBe("Mileage: Unlimited");
  });

  it("labels included cover", () => {
    expect(getIncludedCoverLabel(rate)).toBe("Basic");
    expect(
      getIncludedCoverLabel({
        ...rate,
        config: { ...rate.config, bundledInsurance: true },
      }),
    ).toBe("Full");
    expect(
      getIncludedCoverLabel({ ...rate, insuranceCoverage: undefined }),
    ).toBeUndefined();
    expect(
      getIncludedCoverLabel({ ...rate, insuranceCoverage: { included: [] } }),
    ).toBeUndefined();
  });

  it("maps rating tones", () => {
    expect([9.2, 8.6, 7.7, 6, 3].map(getRatingTone)).toEqual([
      "excellent",
      "very-good",
      "good",
      "average",
      "poor",
    ]);
  });

  it("formats location names", () => {
    expect(formatLocationName(location)).toBe("Malaga - Airport (AGP)");
    expect(formatLocationName({ ...location, airportCode: undefined })).toBe(
      "Malaga - Airport",
    );
  });

  it("humanises pickup types", () => {
    expect(formatPickupType("ShuttleToCounterAndCar")).toBe(
      "Shuttle to counter and car",
    );
    expect(formatPickupType("InTerminal")).toBe("In terminal");
  });
});
