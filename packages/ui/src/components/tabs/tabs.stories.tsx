import type { Meta, StoryObj } from "@storybook/react";
import { AppWindow, Code } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  args: { defaultValue: "preview" },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

function Example({
  variant = "default",
  ...props
}: React.ComponentProps<typeof Tabs> & { variant?: "default" | "line" }) {
  return (
    <Tabs {...props} className="w-[min(85vw,400px)]">
      <TabsList variant={variant} aria-label="Example view">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="source">Source</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="preview"
        className="border-border rounded-lg border p-6"
      >
        Your component preview.
      </TabsContent>
      <TabsContent
        value="source"
        className="border-border rounded-lg border p-6"
      >
        Your component source.
      </TabsContent>
    </Tabs>
  );
}
export const Default: Story = { render: (args) => <Example {...args} /> };
export const WithIcons: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Component view">
        <TabsTrigger value="preview">
          <AppWindow size={16} aria-hidden="true" />
          Preview
        </TabsTrigger>
        <TabsTrigger value="source">
          <Code size={16} aria-hidden="true" />
          Code
        </TabsTrigger>
      </TabsList>
      <TabsContent value="preview">Your component preview.</TabsContent>
      <TabsContent value="source">Your component source.</TabsContent>
    </Tabs>
  ),
};
export const Line: Story = {
  render: (args) => <Example {...args} variant="line" />,
};
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => <Example {...args} />,
};
