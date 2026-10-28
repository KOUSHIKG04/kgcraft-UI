import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[min(90vw,380px)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "file"],
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    type: "text",
    placeholder: "Enter text",
  },
};

export const WithField: Story = {
  args: {
    id: "storybook-username",
    placeholder: "Enter your username",
    "aria-describedby": "storybook-username-description",
  },
  render: (args) => (
    <div className="grid gap-2">
      <label htmlFor={args.id} className="text-sm font-medium">
        Username
      </label>
      <Input {...args} />
      <p
        id="storybook-username-description"
        className="text-muted-foreground text-sm"
      >
        Choose a unique username for your account.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    type: "email",
    placeholder: "Email",
    disabled: true,
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: "not-an-email",
    type: "email",
    "aria-invalid": true,
    "aria-describedby": "storybook-email-error",
  },
  render: (args) => (
    <div className="grid gap-2">
      <label htmlFor="storybook-email" className="text-sm font-medium">
        Email
      </label>
      <Input {...args} id="storybook-email" />
      <p id="storybook-email-error" className="text-destructive text-sm">
        Enter a valid email address.
      </p>
    </div>
  ),
};

export const File: Story = {
  args: {
    type: "file",
    accept: "image/*",
    "aria-label": "Upload a profile picture",
  },
};

export const Required: Story = {
  args: {
    placeholder: "This field is required",
    required: true,
    "aria-label": "Required field",
  },
};

export const RightToLeft: Story = {
  args: {
    dir: "rtl",
    lang: "ar",
    placeholder: "أدخل مفتاح API",
    "aria-label": "مفتاح API",
  },
};
