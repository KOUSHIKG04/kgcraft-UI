import type { Meta, StoryObj } from "@storybook/react";
import { SearchBar } from "./search-bar";

const meta = {
  title: "Components/Search Bar",
  component: SearchBar,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(90vw,420px)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    placeholder: "Search components…",
  },
};

export const Prefilled: Story = {
  args: {
    defaultValue: "command palette",
    placeholder: "Search components…",
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "Search unavailable",
    disabled: true,
  },
};
