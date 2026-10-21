import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CarBlockMedia from "./Media";

describe("CarBlockMedia", () => {
  it("renders a lazy image with alt text", () => {
    render(<CarBlockMedia src="https://example.com/car.png" alt="Yaris" />);
    const img = screen.getByRole("img", { name: "Yaris" });
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("shows a placeholder without a src", () => {
    render(<CarBlockMedia alt="Yaris" />);
    expect(screen.getByText("No image available")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to the placeholder when the image fails", () => {
    render(<CarBlockMedia src="https://example.com/car.png" alt="Yaris" />);
    fireEvent.error(screen.getByRole("img", { name: "Yaris" }));
    expect(screen.getByText("No image available")).toBeInTheDocument();
  });
});
