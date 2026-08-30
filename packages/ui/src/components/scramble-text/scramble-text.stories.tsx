import type { Meta, StoryObj } from "@storybook/react";
import { ScrambleText } from "./scramble-text";

const meta = {
  title: "Components/Scramble Text",
  component: ScrambleText,
  parameters: { layout: "centered" },
  argTypes: {
    speed: {
      control: { type: "range", min: 1, max: 30, step: 1 },
      description: "Characters revealed per second. Higher values are faster.",
    },
    chars: { control: "text" },
    playOnHover: { control: "boolean" },
  },
} satisfies Meta<typeof ScrambleText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Automatic: Story = {
  args: {
    text: "Geist meets thoughtful motion",
    speed: 8,
    className: "text-2xl font-semibold",
  },
};

export const ReplayOnHover: Story = {
  args: {
    text: "Hover over this clean sans-serif type",
    speed: 8,
    playOnHover: true,
    className: "cursor-pointer text-xl font-medium",
  },
};

export const CustomCharacters: Story = {
  args: {
    text: "SYSTEM ONLINE",
    chars: "01#@",
    speed: 12,
    className: "text-xl font-bold tracking-widest",
  },
};
