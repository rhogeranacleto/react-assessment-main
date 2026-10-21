import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  BagIcon,
  CarIcon,
  DoorIcon,
  FuelIcon,
  MileageIcon,
  SeatIcon,
  ShieldIcon,
  TransmissionIcon,
} from "./Icons";

describe("CarIcons", () => {
  it.each([
    ["SeatIcon", SeatIcon],
    ["BagIcon", BagIcon],
    ["DoorIcon", DoorIcon],
    ["TransmissionIcon", TransmissionIcon],
    ["FuelIcon", FuelIcon],
    ["MileageIcon", MileageIcon],
    ["ShieldIcon", ShieldIcon],
    ["CarIcon", CarIcon],
  ])("%s renders a decorative svg", (_name, Icon) => {
    const { container } = render(<Icon className="x" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("x");
  });
});
