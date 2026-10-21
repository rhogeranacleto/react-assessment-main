import { useState } from "react";
import "./Counter.css";

type CounterProps = {
  /** The initial count value. Defaults to 0. */
  initialCount?: number;
};

/**
 * A simple counter used as a starting point for the assessment.
 * Replace or extend this with your own components.
 */
export function Counter({ initialCount = 0 }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div className="counter">
      <p data-testid="count" className="ts-subtitle-m-medium">
        Count: {count}
      </p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;
