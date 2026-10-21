import type { ComponentType } from "react";
import {
  BagIcon,
  DoorIcon,
  FuelIcon,
  MileageIcon,
  SeatIcon,
  ShieldIcon,
  TransmissionIcon,
} from "@/components/CarBlock/Icons";
import {
  formatCount,
  formatFuelPolicy,
  formatMileage,
  getIncludedCoverLabel,
} from "@/components/CarBlock/carRental";
import type { RentalRate, Vehicle } from "@/types/carRental";

type CarBlockFeaturesProps = {
  /** Vehicle (seats, bags, doors, transmission). */
  vehicle: Vehicle;
  /** Selected rate (fuel, mileage, cover). Omit to show vehicle items only. */
  rate?: RentalRate;
};

type Feature = {
  key: string;
  Icon: ComponentType<{ className?: string }>;
  text: string;
  modifier?: string;
};

/** Wrapping list of vehicle and rate features. */
export function CarBlockFeatures({ vehicle, rate }: CarBlockFeaturesProps) {
  const cover = rate ? getIncludedCoverLabel(rate) : undefined;

  const features: Array<Feature | false | undefined> = [
    {
      key: "seats",
      Icon: SeatIcon,
      text: formatCount(vehicle.passengerQuantity, "seat", "seats"),
    },
    {
      key: "bags",
      Icon: BagIcon,
      text: formatCount(vehicle.baggageQuantity, "bag", "bags"),
    },
    {
      key: "doors",
      Icon: DoorIcon,
      text: formatCount(vehicle.doors, "door", "doors"),
    },
    { key: "transmission", Icon: TransmissionIcon, text: vehicle.transmission },
    rate?.fuelPolicy !== undefined && {
      key: "fuel",
      Icon: FuelIcon,
      text: formatFuelPolicy(rate.fuelPolicy),
      modifier: "car-block__feature--fuel",
    },
    rate?.mileagePolicy !== undefined && {
      key: "mileage",
      Icon: MileageIcon,
      text: formatMileage(rate.mileagePolicy),
    },
    cover !== undefined && {
      key: "cover",
      Icon: ShieldIcon,
      text: `Included Cover: ${cover}`,
      modifier: "car-block__feature--cover",
    },
  ];

  return (
    <ul className="car-block__features ts-body-m-normal">
      {features
        .filter((f): f is Feature => Boolean(f))
        .map((f) => (
          <li
            key={f.key}
            className={["car-block__feature", f.modifier]
              .filter(Boolean)
              .join(" ")}
          >
            <f.Icon className="car-block__feature-icon" />
            {f.text}
          </li>
        ))}
    </ul>
  );
}

export default CarBlockFeatures;
