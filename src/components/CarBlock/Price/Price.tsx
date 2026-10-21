import { divideMoney, formatMoney } from "@/components/CarBlock/money";
import type { Money } from "@/types/carRental";

type CarBlockPriceProps = {
  /** Total rental cost. Without it "Price unavailable" is shown. */
  total?: Money;
  /** Rental length in days. When set, the price is per day plus the total. */
  rentalDays?: number;
};

/** Price group: per-day amount and total, or the total only. */
export function CarBlockPrice({ total, rentalDays }: CarBlockPriceProps) {
  if (!total) {
    return (
      <p className="car-block__price-unavailable ts-body-m-normal">
        Price unavailable
      </p>
    );
  }

  const perDay = rentalDays !== undefined && rentalDays >= 1;

  return (
    <div className="car-block__price">
      <p className="car-block__price-main">
        <span className="car-block__price-amount ts-headline-xs-heavy">
          {formatMoney(perDay ? divideMoney(total, rentalDays) : total)}
        </span>
        {perDay ? (
          <>
            <span
              className="car-block__price-unit ts-body-m-heavy"
              aria-hidden="true"
            >
              /day
            </span>
            <span className="car-block__sr-only">per day</span>
          </>
        ) : (
          <span className="car-block__price-unit ts-body-m-heavy"> total</span>
        )}
      </p>
      {perDay && (
        <p className="car-block__price-total ts-body-m-normal">
          Total {formatMoney(total)}
        </p>
      )}
    </div>
  );
}

export default CarBlockPrice;
