import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import CarBlockFeatures from "./Features";

const car = searchResponse.cars[0];
const rate = car.rentalRates[0];

function itemTexts() {
  return within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((li) => li.textContent);
}

describe("CarBlockFeatures", () => {
  it("lists vehicle and rate features in order", () => {
    render(<CarBlockFeatures vehicle={car.vehicle} rate={rate} />);
    expect(itemTexts()).toEqual([
      "5 seats",
      "6 bags",
      "5 doors",
      "Automatic",
      "Fuel policy: Full to full",
      "Mileage: 200 km/day",
      "Included Cover: Basic",
    ]);
  });

  it("shows vehicle items only without a rate", () => {
    render(<CarBlockFeatures vehicle={car.vehicle} />);
    expect(itemTexts()).toEqual(["5 seats", "6 bags", "5 doors", "Automatic"]);
  });

  it("omits the cover item without insurance", () => {
    render(
      <CarBlockFeatures
        vehicle={car.vehicle}
        rate={{ ...rate, insuranceCoverage: undefined }}
      />,
    );
    expect(screen.queryByText(/Included Cover/)).not.toBeInTheDocument();
  });
});
