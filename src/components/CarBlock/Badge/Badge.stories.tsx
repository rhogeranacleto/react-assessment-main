import type { Meta, StoryObj } from "@storybook/react";
import "@/components/CarBlock/CarBlock.css";
import CarBlockBadge from "./Badge";

const meta: Meta<typeof CarBlockBadge> = {
  title: "Components/CarBlock/Badge",
  component: CarBlockBadge,
  tags: ["autodocs"],
  argTypes: {
    cancellation: { control: "object" },
  },
};

export default meta;
type Story = StoryObj<typeof CarBlockBadge>;

/** The design's "Free Cancellation" badge (positive). Not present in the fixture. */
export const Free: Story = {
  args: { cancellation: { kind: "free" } },
};

/** What the fixture produces: a neutral badge showing the cancellation fee. */
export const WithFee: Story = {
  args: {
    cancellation: { kind: "fee", fee: { amount: "180.93", currency: "EUR" } },
  },
};

/** Both alternatives side by side. */
export const Alternatives: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-200)" }}>
      <CarBlockBadge cancellation={{ kind: "free" }} />
      <CarBlockBadge
        cancellation={{
          kind: "fee",
          fee: { amount: "180.93", currency: "EUR" },
        }}
      />
    </div>
  ),
};

/** No cancellation info: nothing renders. */
export const Hidden: Story = {
  args: { cancellation: undefined },
};
