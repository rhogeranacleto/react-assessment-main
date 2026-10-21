// Icon paths adapted from Material Symbols (Apache-2.0).
import type { ReactNode } from "react";

type IconProps = {
  /** Class applied to the svg element. */
  className?: string;
};

type SvgIconProps = IconProps & { children: ReactNode };

function SvgIcon({ className, children }: SvgIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Person: seats. */
export function SeatIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </SvgIcon>
  );
}

/** Suitcase: bags. */
export function BagIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M17 6h-2V3H9v3H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2 1 1 0 0 0 2 0h6a1 1 0 0 0 2 0 2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-6-1h2v1h-2V5Zm-2 12H7V8h2v9Zm4 0h-2V8h2v9Zm4 0h-2V8h2v9Z" />
    </SvgIcon>
  );
}

/** Car door: doors. */
export function DoorIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 21V9.5C5 6 8 3 12 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5Zm2-2h10V5h-5C9.1 5 7 7 7 9.5V19Zm8-6h-3v2h3v-2Z" />
    </SvgIcon>
  );
}

/** Gear shift: transmission. */
export function TransmissionIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M16 13v4H8v-4H5v8h2v-2h10v2h2v-8h-3ZM5 3v8h2V7h8v4h2V3h-2v2H7V3H5Zm5 6h4V7h-4v2Z" />
    </SvgIcon>
  );
}

/** Fuel pump: fuel policy. */
export function FuelIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m19.77 7.23.01-.01-3.72-3.72L15 4.56l2.11 2.11A2.5 2.5 0 0 0 16 9.5 2.5 2.5 0 0 0 18.5 12c.36 0 .7-.08 1-.21V19a1 1 0 0 1-2 0v-5a2 2 0 0 0-2-2H14V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16h10v-7.5h1.5V19a2.5 2.5 0 0 0 5 0V9c0-.69-.28-1.32-.73-1.77ZM12 10H6V5h6v5Z" />
    </SvgIcon>
  );
}

/** Speedometer: mileage. */
export function MileageIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44ZM10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83Z" />
    </SvgIcon>
  );
}

/** Shield: included cover. */
export function ShieldIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" />
    </SvgIcon>
  );
}

/** Car silhouette: missing-image placeholder. */
export function CarIcon({ className }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99ZM6.85 7h10.29l1.04 3H5.81l1.04-3ZM19 17H5v-4.66l.12-.34h13.77l.11.34V17ZM7.5 16a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm9 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </SvgIcon>
  );
}
