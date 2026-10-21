import CarBlock from "@/components/CarBlock";
import type { Car, Location, RentalRate, Vendor } from "@/types/carRental";
import "./CarList.css";

type CarListStatus = "ready" | "loading" | "error";

type CarListProps = {
  /** Cars to render, in order. */
  cars: Car[];
  /** Vendors keyed by id (as in the response). */
  vendors?: Record<string, Vendor>;
  /** Locations keyed by id (as in the response). */
  locations?: Record<string, Location>;
  /** Forwarded to every CarBlock. */
  rentalDays?: number;
  /** Defaults to "ready". */
  status?: CarListStatus;
  /** Shown with status "error". Defaults to "We couldn't load cars. Please try again." */
  errorMessage?: string;
  /** Shown when ready and `cars` is empty. Defaults to "No cars match your search." */
  emptyMessage?: string;
  /** Accessible name of the list. Defaults to "Car hire results". */
  label?: string;
  /** Forwarded to every CarBlock. */
  onSelect?: (car: Car, rate: RentalRate) => void;
  /** Forwarded to every CarBlock. */
  onImportantInfo?: (car: Car) => void;
};

const SKELETON_COUNT = 3;

/** A list of Car Blocks with loading, error and empty states. */
export function CarList({
  cars,
  vendors,
  locations,
  rentalDays,
  status = "ready",
  errorMessage = "We couldn't load cars. Please try again.",
  emptyMessage = "No cars match your search.",
  label = "Car hire results",
  onSelect,
  onImportantInfo,
}: CarListProps) {
  if (status === "loading") {
    return (
      <div className="car-list__loading" aria-busy="true">
        <p className="car-list__message ts-body-m-normal" role="status">
          Loading cars…
        </p>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div key={index} className="car-list__skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="car-list__error ts-body-m-medium" role="alert">
        {errorMessage}
      </p>
    );
  }

  if (cars.length === 0) {
    return (
      <p className="car-list__message ts-body-m-normal" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="car-list" aria-label={label}>
      {cars.map((car) => (
        <li key={car.id}>
          <CarBlock
            car={car}
            headingLevel={3}
            vendor={vendors?.[String(car.vendorId)]}
            pickupLocation={locations?.[String(car.pickupLocationId)]}
            rentalDays={rentalDays}
            onSelect={onSelect}
            onImportantInfo={onImportantInfo}
          />
        </li>
      ))}
    </ul>
  );
}

export default CarList;
