import { formatMoney } from "@/components/CarBlock/money";
import type { CancellationInfo } from "@/types/carRental";

type CarBlockBadgeProps = {
  /** Cancellation info; nothing renders when undefined. */
  cancellation?: CancellationInfo;
};

/** Cancellation badge: free (positive) or with a fee (neutral). */
export function CarBlockBadge({ cancellation }: CarBlockBadgeProps) {
  if (!cancellation) return null;

  return cancellation.kind === "free" ? (
    <p className="car-block__badge car-block__badge--free ts-body-s-medium">
      Free Cancellation
    </p>
  ) : (
    <p className="car-block__badge car-block__badge--fee ts-body-s-medium">
      Cancellation fee {formatMoney(cancellation.fee)}
    </p>
  );
}

export default CarBlockBadge;
