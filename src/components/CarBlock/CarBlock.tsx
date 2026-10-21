import { useId } from "react";
import CarBlockBadge from "./Badge";
import CarBlockFeatures from "./Features";
import CarBlockLocation from "./Location";
import CarBlockMedia from "./Media";
import CarBlockPrice from "./Price";
import CarBlockVendor from "./Vendor";
import { formatVehicleName, getCancellation, selectRate } from "./carRental";
import type { Car, Location, RentalRate, Vendor } from "@/types/carRental";
import "./CarBlock.css";

type CarBlockProps = {
  /** Car to render; the best rate is chosen with `selectRate`. */
  car: Car;
  /** Supplier of the car (logo, name). Omit to hide the vendor box. */
  vendor?: Vendor;
  /** Pickup location (name, pickup type, rating). Omit to hide those parts. */
  pickupLocation?: Location;
  /** Rental length in days. When set, the price shows per day plus total. */
  rentalDays?: number;
  /** Heading level for the category title. Defaults to 3. */
  headingLevel?: 2 | 3 | 4;
  /** Called by the Select button (Large/XL). Button is not rendered without it or without a rate. */
  onSelect?: (car: Car, rate: RentalRate) => void;
  /** Called by the Important information link (Large/XL). Not rendered without it. */
  onImportantInfo?: (car: Car) => void;
};

/** A single car result card: vehicle details, pricing and policies. */
export function CarBlock({
  car,
  vendor,
  pickupLocation,
  rentalDays,
  headingLevel = 3,
  onSelect,
  onImportantInfo,
}: CarBlockProps) {
  const titleId = useId();
  const nameId = useId();
  const Heading = `h${headingLevel}` as const;

  const { vehicle } = car;
  const rate = selectRate(car.rentalRates);
  const vehicleName = formatVehicleName(vehicle);

  return (
    <article className="car-block" aria-labelledby={`${titleId} ${nameId}`}>
      <CarBlockMedia src={vehicle.imageUrl} alt={vehicleName} />
      <div className="car-block__content">
        <CarBlockBadge cancellation={rate && getCancellation(rate)} />
        <div className="car-block__body">
          <div className="car-block__main">
            <div>
              <Heading
                id={titleId}
                className="car-block__title ts-body-l-heavy"
              >
                {vehicle.description || vehicle.style}
              </Heading>
              <p id={nameId} className="car-block__name ts-body-m-normal">
                {vehicleName}
              </p>
            </div>
            <CarBlockFeatures vehicle={vehicle} rate={rate} />
            {pickupLocation && <CarBlockLocation location={pickupLocation} />}
            {onImportantInfo && (
              <button
                type="button"
                className="car-block__link ts-body-m-heavy"
                onClick={() => onImportantInfo(car)}
              >
                Important information
              </button>
            )}
          </div>
          <div className="car-block__aside">
            <CarBlockVendor vendor={vendor} ratings={pickupLocation?.ratings} />
            <div className="car-block__buy">
              <CarBlockPrice
                total={rate?.pricing.totalRentalCostRequested}
                rentalDays={rentalDays}
              />
              {onSelect && rate && (
                <button
                  type="button"
                  className="car-block__select ts-button-m-heavy"
                  aria-label={`Select ${vehicleName}`}
                  onClick={() => onSelect(car, rate)}
                >
                  Select
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CarBlock;
