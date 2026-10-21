import { getRatingTone } from "@/components/CarBlock/carRental";
import type { LocationRatings, Vendor } from "@/types/carRental";

type CarBlockVendorProps = {
  /** Supplier; its logo (or name) is shown in the box. */
  vendor?: Vendor;
  /** Pickup location rating shown next to the logo. */
  ratings?: LocationRatings;
};

/** Vendor logo box with rating chip and rating label. */
export function CarBlockVendor({ vendor, ratings }: CarBlockVendorProps) {
  if (!vendor && !ratings) return null;

  return (
    <div className="car-block__vendor">
      <div className="car-block__vendor-box">
        {vendor &&
          (vendor.imageSVGUrl ? (
            <img
              className="car-block__vendor-logo"
              src={vendor.imageSVGUrl}
              alt={vendor.name}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="car-block__vendor-name ts-body-s-heavy">
              {vendor.name}
            </span>
          ))}
        {ratings && (
          <span
            className="car-block__rating-chip ts-body-m-medium"
            data-tone={getRatingTone(Number(ratings.reviewScore))}
            role="img"
            aria-label={`Rating ${ratings.reviewScore} out of 10`}
          >
            {ratings.reviewScore}
          </span>
        )}
      </div>
      {ratings && (
        <span className="car-block__rating-label ts-body-s-heavy">
          {ratings.label}
        </span>
      )}
    </div>
  );
}

export default CarBlockVendor;
