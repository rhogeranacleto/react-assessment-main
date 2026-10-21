import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Counter from "./Counter";

describe("Counter", () => {
  it("renders the initial count", () => {
    render(<Counter />);
    expect(screen.getByTestId("count")).toHaveTextContent("Count: 0");
  });

  it("respects a custom initial count", () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByTestId("count")).toHaveTextContent("Count: 5");
  });

  it("increments when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<Counter />);

    await user.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByTestId("count")).toHaveTextContent("Count: 1");

    await user.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByTestId("count")).toHaveTextContent("Count: 2");
  });
});
