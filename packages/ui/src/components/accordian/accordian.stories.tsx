import type { Meta, StoryObj } from "@storybook/react";
import { Accordian } from "./accordian";

const meta: Meta<typeof Accordian> = {
  title: "Components/Accordian",
  component: Accordian,
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "card", "ghost"],
    },
    iconPosition: {
      control: { type: "radio" },
      options: ["left", "right"],
    },
    iconType: {
      control: { type: "radio" },
      options: ["chevron", "plus-minus"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordian>;

export const Default: Story = {
  args: {
    children: "Accordion Header",
    content:
      "This is the animated content inside the accordion! You can toggle this and watch it expand smoothly.",
    variant: "default",
    iconPosition: "right",
    iconType: "chevron",
  },
};

export const LeftIconPlusMinus: Story = {
  args: {
    children: "Plus Minus Accordion on Left",
    content:
      "This accordion uses the plus-minus icon type placed on the left side of the title.",
    variant: "default",
    iconPosition: "left",
    iconType: "plus-minus",
  },
};
