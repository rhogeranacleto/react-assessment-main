import { useState } from "react";
import { CarIcon } from "@/components/CarBlock/Icons";

type CarBlockMediaProps = {
  /** Image URL. A missing or broken image shows a placeholder. */
  src?: string;
  /** Alt text for the image. */
  alt: string;
};

/** Image area of the Car Block with a placeholder fallback. */
export function CarBlockMedia({ src, alt }: CarBlockMediaProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="car-block__media">
      {src && !failed ? (
        <img
          className="car-block__image"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          <CarIcon className="car-block__placeholder" />
          <span className="car-block__sr-only">No image available</span>
        </>
      )}
    </div>
  );
}

export default CarBlockMedia;
