import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import CarBlockVendor from "./Vendor";

const vendor = searchResponse.vendors["321"];
const ratings = searchResponse.locations["203367"].ratings;

describe("CarBlockVendor", () => {
  it("shows the logo, rating chip and label", () => {
    render(<CarBlockVendor vendor={vendor} ratings={ratings} />);
    expect(screen.getByRole("img", { name: "NIZA" })).toBeInTheDocument();
    const chip = screen.getByRole("img", { name: "Rating 7.7 out of 10" });
    expect(chip).toHaveTextContent("7.7");
    expect(chip).toHaveAttribute("data-tone", "good");
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("falls back to the vendor name without a logo", () => {
    render(<CarBlockVendor vendor={{ ...vendor, imageSVGUrl: undefined }} />);
    expect(screen.getByText("NIZA")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders nothing when both are missing", () => {
    const { container } = render(<CarBlockVendor />);
    expect(container).toBeEmptyDOMElement();
  });
});
