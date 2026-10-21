import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CarBlockBadge from "./Badge";

describe("CarBlockBadge", () => {
  it("shows free cancellation", () => {
    render(<CarBlockBadge cancellation={{ kind: "free" }} />);
    expect(screen.getByText("Free Cancellation")).toBeInTheDocument();
  });

  it("shows the cancellation fee", () => {
    render(
      <CarBlockBadge
        cancellation={{
          kind: "fee",
          fee: { amount: "180.93", currency: "EUR" },
        }}
      />,
    );
    expect(screen.getByText("Cancellation fee €180.93")).toBeInTheDocument();
  });

  it("renders nothing without cancellation info", () => {
    const { container } = render(<CarBlockBadge />);
    expect(container).toBeEmptyDOMElement();
  });
});
