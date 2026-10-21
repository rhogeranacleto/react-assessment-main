import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CarBlockPrice from "./Price";

const total = { amount: "132.34", currency: "EUR" };

describe("CarBlockPrice", () => {
  it("shows the per-day price and the total", () => {
    render(<CarBlockPrice total={total} rentalDays={2} />);
    expect(screen.getByText("€66.17")).toBeInTheDocument();
    expect(screen.getByText("per day")).toBeInTheDocument();
    expect(screen.getByText("Total €132.34")).toBeInTheDocument();
  });

  it("shows only the total without rental days", () => {
    render(<CarBlockPrice total={total} />);
    expect(screen.getByText("€132.34")).toBeInTheDocument();
    expect(screen.getByText("total")).toBeInTheDocument();
    expect(screen.queryByText(/^Total/)).not.toBeInTheDocument();
  });

  it("shows a fallback without a total", () => {
    render(<CarBlockPrice />);
    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
  });
});
