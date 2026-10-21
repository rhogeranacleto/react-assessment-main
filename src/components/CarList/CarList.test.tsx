import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import CarList from "./CarList";

const { cars, vendors, locations } = searchResponse;

describe("CarList", () => {
  it("renders every fixture car in order", () => {
    render(<CarList cars={cars} vendors={vendors} locations={locations} />);
    const list = screen.getByRole("list", { name: "Car hire results" });
    // Each card has its own feature list, so count only direct items.
    expect(list.children).toHaveLength(5);
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
    [
      "BMW X5 or similar",
      "BMW X3 or similar",
      "Volkswagen Golf or similar",
      "Toyota Yaris or similar",
      "Opel Corsa or similar",
    ].forEach((name, index) => {
      expect(within(articles[index]).getByText(name)).toBeInTheDocument();
    });
  });

  it("shows an empty message", () => {
    render(<CarList cars={[]} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "No cars match your search.",
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows a loading state", () => {
    const { container } = render(<CarList cars={cars} status="loading" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading cars…");
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows default and custom error messages", () => {
    const { rerender } = render(<CarList cars={cars} status="error" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't load cars. Please try again.",
    );
    rerender(<CarList cars={cars} status="error" errorMessage="Boom" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Boom");
  });

  it("forwards onSelect for the clicked car", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CarList cars={cars} onSelect={onSelect} />);
    const buttons = screen.getAllByRole("button", { name: /^Select/ });
    await user.click(buttons[2]);
    expect(onSelect).toHaveBeenCalledWith(cars[2], cars[2].rentalRates[0]);
  });

  it("looks up vendors and locations per car", () => {
    render(<CarList cars={cars} vendors={vendors} locations={locations} />);
    expect(screen.getAllByRole("img", { name: "NIZA" })).toHaveLength(5);
    expect(screen.getAllByText("Malaga - Airport (AGP)")).toHaveLength(5);
  });
});
