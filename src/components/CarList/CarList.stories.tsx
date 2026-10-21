import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { searchResponse } from "@/data/searchResponse";
import type { Car } from "@/types/carRental";
import CarList from "./CarList";

const { cars, vendors, locations } = searchResponse;

const meta: Meta<typeof CarList> = {
  title: "Components/CarList",
  component: CarList,
  tags: ["autodocs"],
  args: {
    cars,
    vendors,
    locations,
    rentalDays: 2,
    onSelect: fn(),
    onImportantInfo: fn(),
  },
  argTypes: {
    cars: { control: "object" },
    vendors: { control: "object" },
    locations: { control: "object" },
    rentalDays: { control: "number" },
    status: { control: "inline-radio", options: ["ready", "loading", "error"] },
    errorMessage: { control: "text" },
    emptyMessage: { control: "text" },
    label: { control: "text" },
    onSelect: { action: "select" },
    onImportantInfo: { action: "importantInfo" },
  },
  parameters: {
    viewport: {
      options: {
        cardSmall: {
          name: "Small (375)",
          styles: { width: "375px", height: "800px" },
          type: "mobile",
        },
        cardMedium: {
          name: "Medium (700)",
          styles: { width: "700px", height: "900px" },
          type: "tablet",
        },
        cardLarge: {
          name: "Large (900)",
          styles: { width: "900px", height: "900px" },
          type: "tablet",
        },
        cardXL: {
          name: "XL (1280)",
          styles: { width: "1280px", height: "900px" },
          type: "desktop",
        },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CarList>;

/** Edge-case variants derived from the fixture cars. */
function mixedEdgeCases(): Car[] {
  const [first, second, third, ...rest] = cars;
  const free: Car = {
    ...first,
    rentalRates: first.rentalRates.map((rate) => ({
      ...rate,
      pricing: {
        ...rate.pricing,
        cancellationPolicy: rate.pricing.cancellationPolicy && {
          ...rate.pricing.cancellationPolicy,
          fee: undefined,
        },
      },
    })),
  };
  const noImage: Car = {
    ...second,
    vehicle: { ...second.vehicle, imageUrl: undefined },
  };
  const noInsurance: Car = {
    ...third,
    rentalRates: third.rentalRates.map((rate) => ({
      ...rate,
      insuranceCoverage: undefined,
    })),
  };
  return [free, noImage, noInsurance, ...rest];
}

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "cardSmall", isRotated: false } },
};

export const Tablet: Story = {
  globals: { viewport: { value: "cardMedium", isRotated: false } },
};

export const LargeTablet: Story = {
  globals: { viewport: { value: "cardLarge", isRotated: false } },
};

export const Desktop: Story = {
  globals: { viewport: { value: "cardXL", isRotated: false } },
};

export const Empty: Story = {
  args: { cars: [] },
};

export const Loading: Story = {
  args: { status: "loading" },
};

export const Error: Story = {
  args: { status: "error" },
};

export const MixedEdgeCases: Story = {
  args: { cars: mixedEdgeCases() },
};
