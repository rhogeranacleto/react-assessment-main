import type {
  CancellationInfo,
  Location,
  MileagePolicy,
  RatingTone,
  RentalRate,
  Vehicle,
} from "@/types/carRental";
import { isZeroMoney } from "./money";

const pluralRules = new Intl.PluralRules("en");

const FUEL_POLICIES: Record<string, string> = {
  FULLFULL: "Full to full",
  FULLEMPTY: "Full to empty",
  EMPTYEMPTY: "Empty to empty",
  SAMESAME: "Same to same",
};

/** Lowest `orderByRelevance` wins; ties keep array order; empty gives `undefined`. */
export function selectRate(
  rates: readonly RentalRate[],
): RentalRate | undefined {
  return rates.reduce<RentalRate | undefined>(
    (best, rate) =>
      best === undefined ||
      rate.config.orderByRelevance < best.config.orderByRelevance
        ? rate
        : best,
    undefined,
  );
}

export function getCancellation(
  rate: RentalRate,
): CancellationInfo | undefined {
  const policy = rate.pricing.cancellationPolicy;
  if (!policy) return undefined;
  if (!policy.fee || isZeroMoney(policy.fee)) return { kind: "free" };
  return { kind: "fee", fee: policy.fee };
}

export function formatVehicleName(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model}`
    .replace(/\bor similar\b/i, "or similar")
    .trim();
}

export function formatCount(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count} ${pluralRules.select(count) === "one" ? singular : plural}`;
}

export function formatFuelPolicy(policy: string): string {
  return `Fuel policy: ${FUEL_POLICIES[policy] ?? policy}`;
}

export function formatMileage(policy: MileagePolicy): string {
  const quantity = Number(policy.quantity);
  const unlimited =
    /unlimited/i.test(policy.description) ||
    !policy.quantity ||
    !(quantity > 0);
  if (unlimited) return "Mileage: Unlimited";
  const unit = (policy.distUnitName ?? "").toLowerCase();
  const period = (policy.vehiclePeriodUnitName ?? "").toLowerCase();
  const perPeriod = period ? `/${period}` : "";
  return `Mileage: ${policy.quantity} ${unit}${perPeriod}`.trim();
}

/** "Basic" / "Full" when any cover is included; otherwise `undefined`. */
export function getIncludedCoverLabel(rate: RentalRate): string | undefined {
  if (!rate.insuranceCoverage?.included.length) return undefined;
  return rate.config.bundledInsurance ? "Full" : "Basic";
}

export function getRatingTone(score: number): RatingTone {
  if (score >= 9) return "excellent";
  if (score >= 8) return "very-good";
  if (score >= 7) return "good";
  if (score >= 5) return "average";
  return "poor";
}

export function formatLocationName(location: Location): string {
  return location.airportCode
    ? `${location.name} (${location.airportCode})`
    : location.name;
}

/** `ShuttleToCounterAndCar` becomes "Shuttle to counter and car". */
export function formatPickupType(pickupType: string): string {
  const words = pickupType.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
