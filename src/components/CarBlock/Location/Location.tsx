import {
  formatLocationName,
  formatPickupType,
} from "@/components/CarBlock/carRental";
import type { Location } from "@/types/carRental";

type CarBlockLocationProps = {
  /** Pickup location. */
  location: Location;
};

/** Pickup location name and pickup type. */
export function CarBlockLocation({ location }: CarBlockLocationProps) {
  return (
    <div className="car-block__location">
      <p className="car-block__location-name ts-body-m-medium">
        {formatLocationName(location)}
      </p>
      <p className="car-block__pickup-type ts-body-s-normal">
        {formatPickupType(location.pickupType)}
      </p>
    </div>
  );
}

export default CarBlockLocation;
