import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "outline"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "BUTTON",
    variant: "primary",
    size: "md",
  },
};

export const Secondary: Story = {
  args: {
    children: "BUTTON",
    variant: "secondary",
    size: "md",
  },
};

export const Outline: Story = {
  args: {
    children: "BUTTON",
    variant: "outline",
    size: "md",
  },
};

export const BriskPrimary: Story = {
  args: {
    children: "BUTTON",
    variant: "briskPrimary",
    size: "md",
  },
};

export const BriskSecondary: Story = {
  args: {
    children: "BUTTON",
    variant: "briskSecondary",
    size: "md",
  },
};
