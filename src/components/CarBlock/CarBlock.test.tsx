import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import type { Car } from "@/types/carRental";
import CarBlock from "./CarBlock";

const car = searchResponse.cars[0];
const rate = car.rentalRates[0];
const vendor = searchResponse.vendors["321"];
const pickupLocation = searchResponse.locations["203367"];

describe("CarBlock", () => {
  it("renders the key fields of a fixture car", () => {
    render(
      <CarBlock
        car={car}
        vendor={vendor}
        pickupLocation={pickupLocation}
        rentalDays={2}
      />,
    );
    expect(
      screen.getByRole("article", { name: "SUV BMW X5 or similar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "SUV" }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: "BMW X5 or similar" }),
    ).toHaveAttribute("src", car.vehicle.imageUrl);
    expect(screen.getByText("5 seats")).toBeInTheDocument();
    expect(screen.getByText("Mileage: 200 km/day")).toBeInTheDocument();
    expect(screen.getByText("Cancellation fee €180.93")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "NIZA" })).toBeInTheDocument();
    expect(screen.getByText("Malaga - Airport (AGP)")).toBeInTheDocument();
    expect(screen.getByText("€180.93")).toBeInTheDocument();
    expect(screen.getByText("Total €361.85")).toBeInTheDocument();
  });

  it("supports another heading level", () => {
    render(<CarBlock car={car} headingLevel={2} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "SUV" }),
    ).toBeVisible();
  });

  it("calls onSelect with the car and its rate", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CarBlock car={car} onSelect={onSelect} />);
    await user.click(
      screen.getByRole("button", { name: "Select BMW X5 or similar" }),
    );
    expect(onSelect).toHaveBeenCalledWith(car, rate);
  });

  it("selects with the keyboard", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CarBlock car={car} onSelect={onSelect} />);
    await user.tab();
    expect(
      screen.getByRole("button", { name: "Select BMW X5 or similar" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("calls onImportantInfo with the car", async () => {
    const user = userEvent.setup();
    const onImportantInfo = vi.fn();
    render(<CarBlock car={car} onImportantInfo={onImportantInfo} />);
    await user.click(
      screen.getByRole("button", { name: "Important information" }),
    );
    expect(onImportantInfo).toHaveBeenCalledWith(car);
  });

  it("omits the controls without callbacks", () => {
    render(<CarBlock car={car} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("handles a car without rates", () => {
    const noRates: Car = { ...car, rentalRates: [] };
    render(<CarBlock car={noRates} onSelect={vi.fn()} />);
    expect(screen.getByText("BMW X5 or similar")).toBeInTheDocument();
    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
    expect(screen.queryByText(/Cancellation fee/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the lowest relevance rate", () => {
    const cheaper = {
      ...rate,
      pricing: {
        ...rate.pricing,
        totalRentalCostRequested: { amount: "100.00", currency: "EUR" },
      },
      config: { ...rate.config, orderByRelevance: 1 },
    };
    const multi: Car = { ...car, rentalRates: [cheaper, rate] };
    render(<CarBlock car={multi} />);
    expect(screen.getByText("€361.85")).toBeInTheDocument();
    expect(screen.queryByText("€100")).not.toBeInTheDocument();
  });

  it("shows a placeholder without an image", () => {
    const noImage: Car = {
      ...car,
      vehicle: { ...car.vehicle, imageUrl: undefined },
    };
    render(<CarBlock car={noImage} />);
    expect(screen.getByText("No image available")).toBeInTheDocument();
  });

  it("renders long names in full", () => {
    const longModel = "GLE 450 4MATIC Coupé AMG Line Premium Plus or similar";
    const long: Car = {
      ...car,
      vehicle: { ...car.vehicle, make: "Mercedes-Benz", model: longModel },
    };
    render(<CarBlock car={long} />);
    expect(screen.getByText(`Mercedes-Benz ${longModel}`)).toBeInTheDocument();
  });

  it("renders without vendor and location", () => {
    render(<CarBlock car={car} />);
    expect(screen.queryByRole("img", { name: "NIZA" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Malaga/)).not.toBeInTheDocument();
  });
});
