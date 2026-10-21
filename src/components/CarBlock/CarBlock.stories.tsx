import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { searchResponse } from "@/data/searchResponse";
import type { Car, RentalRate } from "@/types/carRental";
import CarBlock from "./CarBlock";

const [bmwX5] = searchResponse.cars;
const yaris = searchResponse.cars[3];
const vendor = searchResponse.vendors["321"];
const pickupLocation = searchResponse.locations["203367"];

/** Replaces the first rate of a car with a modified copy. */
function withRate(car: Car, change: (rate: RentalRate) => RentalRate): Car {
  return { ...car, rentalRates: car.rentalRates.map(change) };
}

function withVehicle(car: Car, vehicle: Partial<Car["vehicle"]>): Car {
  return { ...car, vehicle: { ...car.vehicle, ...vehicle } };
}

const meta: Meta<typeof CarBlock> = {
  title: "Components/CarBlock",
  component: CarBlock,
  tags: ["autodocs"],
  args: {
    car: yaris,
    vendor,
    pickupLocation,
    rentalDays: 2,
    onSelect: fn(),
    onImportantInfo: fn(),
  },
  argTypes: {
    car: { control: "object" },
    vendor: { control: "object" },
    pickupLocation: { control: "object" },
    rentalDays: { control: "number" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4] },
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

type Story = StoryObj<typeof CarBlock>;

export const Default: Story = {};

export const Small: Story = {
  globals: { viewport: { value: "cardSmall", isRotated: false } },
};

export const Medium: Story = {
  globals: { viewport: { value: "cardMedium", isRotated: false } },
};

export const Large: Story = {
  globals: { viewport: { value: "cardLarge", isRotated: false } },
};

export const XL: Story = {
  globals: { viewport: { value: "cardXL", isRotated: false } },
};

export const FreeCancellation: Story = {
  args: {
    car: withRate(yaris, (rate) => ({
      ...rate,
      pricing: {
        ...rate.pricing,
        cancellationPolicy: rate.pricing.cancellationPolicy && {
          ...rate.pricing.cancellationPolicy,
          fee: undefined,
        },
      },
    })),
  },
};

export const CancellationFee: Story = {
  args: { car: bmwX5 },
};

export const UnlimitedMileage: Story = {
  args: {
    car: withRate(yaris, (rate) => ({
      ...rate,
      mileagePolicy: rate.mileagePolicy && {
        ...rate.mileagePolicy,
        description: "Unlimited mileage",
        quantity: undefined,
      },
    })),
  },
};

export const NoInsurance: Story = {
  args: {
    car: withRate(yaris, (rate) => ({ ...rate, insuranceCoverage: undefined })),
  },
};

export const MissingImage: Story = {
  args: { car: withVehicle(yaris, { imageUrl: undefined }) },
};

export const BrokenImage: Story = {
  args: {
    car: withVehicle(yaris, { imageUrl: "https://invalid.example/car.png" }),
  },
};

export const LongName: Story = {
  args: {
    car: withVehicle(yaris, {
      make: "Mercedes-Benz",
      model: "GLE 450 4MATIC Coupé AMG Line Premium Plus or similar",
    }),
  },
};

export const TotalOnly: Story = {
  args: { rentalDays: undefined },
};

export const NoRates: Story = {
  args: { car: { ...yaris, rentalRates: [] } },
};

export const NoVendorOrLocation: Story = {
  args: { vendor: undefined, pickupLocation: undefined },
};

export const MultipleRates: Story = {
  args: {
    car: {
      ...yaris,
      rentalRates: [
        ...yaris.rentalRates.map((rate) => ({
          ...rate,
          pricing: {
            ...rate.pricing,
            totalRentalCostRequested: { amount: "20.00", currency: "EUR" },
          },
          config: { ...rate.config, orderByRelevance: 1 },
        })),
        ...yaris.rentalRates,
      ],
    },
  },
};
