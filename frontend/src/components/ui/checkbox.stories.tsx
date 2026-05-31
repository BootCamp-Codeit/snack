import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["checkbox01", "checkbox02"],
    },
    checkboxSize: {
      control: "select",
      options: ["sm", "md"],
    },
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// --- Checkbox 01 (upper: sm, lower: md) ---
export const Checkbox01Sm: Story = {
  args: {
    variant: "checkbox01",
    checkboxSize: "sm",
  },
}

export const Checkbox01SmChecked: Story = {
  args: {
    variant: "checkbox01",
    checkboxSize: "sm",
    checked: true,
  },
}

export const Checkbox01Md: Story = {
  args: {
    variant: "checkbox01",
    checkboxSize: "md",
  },
}

export const Checkbox01MdChecked: Story = {
  args: {
    variant: "checkbox01",
    checkboxSize: "md",
    checked: true,
  },
}

// --- Checkbox 02 (upper: sm, lower: md) — 1st default, 2nd checked, 3rd disabled ---
export const Checkbox02SmDefault: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "sm",
  },
}

export const Checkbox02SmChecked: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "sm",
    checked: true,
  },
}

export const Checkbox02SmDisabled: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "sm",
    disabled: true,
  },
}

export const Checkbox02MdDefault: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "md",
  },
}

export const Checkbox02MdChecked: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "md",
    checked: true,
  },
}

export const Checkbox02MdDisabled: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "md",
    disabled: true,
  },
}

// With optional label (no placeholder; consumer provides text)
export const Checkbox02WithLabel: Story = {
  args: {
    variant: "checkbox02",
    checkboxSize: "md",
    label: "Accept terms",
  },
}
