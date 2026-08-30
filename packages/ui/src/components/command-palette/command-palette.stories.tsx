import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FileText, Home, Settings } from "lucide-react";
import { Button } from "../button/button";
import { CommandPalette, type CommandPaletteProps } from "./command-palette";

const items: CommandPaletteProps["items"] = [
  {
    id: "home",
    label: "Go home",
    description: "Return to the project overview",
    shortcut: "G H",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "docs",
    label: "Open documentation",
    description: "Read the component installation guides",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "settings",
    label: "Open settings",
    description: "Change workspace preferences",
    shortcut: "⌘ ,",
    icon: <Settings className="h-4 w-4" />,
  },
];

function ControlledExample(props: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command palette
      </Button>
      <CommandPalette {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}

const meta = {
  title: "Components/Command Palette",
  component: CommandPalette,
  parameters: { layout: "centered" },
  argTypes: {
    defaultOpen: { control: "boolean" },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    items: { control: false },
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    items,
    defaultOpen: true,
  },
};

export const ControlledWithTrigger: Story = {
  args: { items },
  render: (args) => <ControlledExample {...args} />,
};

export const EmptyState: Story = {
  args: {
    items: [],
    defaultOpen: true,
    emptyMessage: "No KGCraft commands found.",
  },
};
