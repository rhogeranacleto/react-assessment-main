import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { searchResponse } from "@/data/searchResponse";
import CarBlockLocation from "./Location";

describe("CarBlockLocation", () => {
  it("shows the location name and pickup type", () => {
    render(<CarBlockLocation location={searchResponse.locations["203367"]} />);
    expect(screen.getByText("Malaga - Airport (AGP)")).toBeInTheDocument();
    expect(screen.getByText("Shuttle to counter and car")).toBeInTheDocument();
  });
});
