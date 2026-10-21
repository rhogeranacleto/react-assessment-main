import type { Meta, StoryObj } from "@storybook/react";
import Counter from "./Counter";

const meta: Meta<typeof Counter> = {
  title: "Components/Counter",
  component: Counter,
  tags: ["autodocs"],
  argTypes: {
    initialCount: { control: "number" },
  },
};

export default meta;

type Story = StoryObj<typeof Counter>;

export const Default: Story = {};

export const CustomStart: Story = {
  args: {
    initialCount: 10,
  },
};
