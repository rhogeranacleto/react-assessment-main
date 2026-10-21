/** Money value as delivered by the API: amounts are strings. */
export type Money = { amount: string; currency: string };

export type Vehicle = {
  style: string;
  description: string;
  make: string;
  model: string;
  imageUrl?: string;
  acrissCode: string;
  doors: number;
  baggageQuantity: number;
  passengerQuantity: number;
  /** Known values: "Automatic", "Manual". */
  transmission: string;
  fuelType: string;
  commitment: string;
};

export type CancellationPolicy = {
  /** Missing or zero means the cancellation is free. */
  fee?: Money;
  /** Known values: "BeforePickup". */
  applicability: string;
  /** Known values: "Hour". */
  unitType: string;
  quantity: string;
  limitTimestamp: string;
};

export type Pricing = {
  totalRentalCostRequested: Money;
  cancellationPolicy?: CancellationPolicy;
};

export type Deposit = { amount: Money; minAmount: string; maxAmount: string };

export type MileagePolicy = {
  description: string;
  taxInclusive: boolean;
  includedInRate: boolean;
  distUnitName?: string;
  quantity?: string;
  vehiclePeriodUnitName?: string;
  additionalDistance?: Money & { applicability: string };
};

export type RateConfig = {
  orderByRelevance: number;
  insuranceAvailable: boolean;
  bundledInsurance: boolean;
  supportsDebitCard: boolean;
  /** Known values: "PREPAID_IN". */
  paymentType: string;
};

export type InsuranceItem = {
  description: string;
  taxInclusive: boolean;
  includedInRate: boolean;
  deductible?: { requestCurrency: Money };
};

export type InsuranceCoverage = { included: InsuranceItem[] };

export type RentalRate = {
  carId: string;
  pricing: Pricing;
  deposit?: Deposit;
  /** Known values: "FULLFULL", "FULLEMPTY", "EMPTYEMPTY", "SAMESAME". */
  fuelPolicy?: string;
  mileagePolicy?: MileagePolicy;
  config: RateConfig;
  insuranceCoverage?: InsuranceCoverage;
};

export type Car = {
  id: string;
  vendorId: number;
  pickupLocationId: number;
  dropOffLocationId: number;
  vehicle: Vehicle;
  rentalRates: RentalRate[];
};

export type Vendor = {
  name: string;
  imageUrl?: string;
  imageSVGUrl?: string;
  imageName?: string;
  flightDetailsRequired: boolean;
};

export type LocationRatings = { label: string; reviewScore: string };

export type Location = {
  name: string;
  atAirport: boolean;
  atTrainStation: boolean;
  latitude: string;
  longitude: string;
  addressLine: string;
  countryCode: string;
  phoneNumber: string;
  timezone: string;
  ratings?: LocationRatings;
  /** Known values: "ShuttleToCounterAndCar", "InTerminal". */
  pickupType: string;
  airportCode?: string;
};

export type SearchResponse = {
  productType: string;
  searchId: string;
  responseTime: string;
  cars: Car[];
  vendors: Record<string, Vendor>;
  locations: Record<string, Location>;
};

export type CancellationInfo = { kind: "free" } | { kind: "fee"; fee: Money };

export type RatingTone =
  "excellent" | "very-good" | "good" | "average" | "poor";
