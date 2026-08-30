import type { Meta, StoryObj } from "@storybook/react";
import { ShimmerText } from "./shimmer-text";

const meta = {
  title: "Components/Shimmer Text",
  component: ShimmerText,
  parameters: { layout: "centered" },
  argTypes: {
    duration: { control: { type: "range", min: 0.5, max: 8, step: 0.25 } },
    repeatDelay: {
      control: { type: "range", min: 0, max: 5, step: 0.25 },
    },
  },
} satisfies Meta<typeof ShimmerText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "Building thoughtful interfaces",
    duration: 2,
    repeatDelay: 0.5,
    className: "text-3xl font-semibold",
  },
};

export const SlowHeading: Story = {
  args: {
    text: "A slower, softer shimmer",
    duration: 5,
    repeatDelay: 1,
    className: "text-4xl font-bold tracking-tight",
  },
};

export const CompactLabel: Story = {
  args: {
    text: "Generating preview…",
    duration: 1.5,
    repeatDelay: 0,
    className: "text-sm font-medium",
  },
};
