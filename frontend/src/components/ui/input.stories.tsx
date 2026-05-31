import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input, Textarea } from "./input"

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outlined", "search", "number"],
    },
    inputSize: {
      control: "select",
      options: ["sm", "md"],
    },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: {
      control: "boolean",
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: "Hello World",
  },
}

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
}

export const SearchSm: Story = {
  args: {
    variant: "search",
    inputSize: "sm",
    placeholder: "Search...",
  },
}

export const SearchMd: Story = {
  args: {
    variant: "search",
    inputSize: "md",
    placeholder: "Search...",
  },
}

export const SearchWithValue: Story = {
  args: {
    variant: "search",
    inputSize: "md",
    defaultValue: "query",
    placeholder: "Search...",
  },
}

export const OutlinedSm: Story = {
  args: {
    variant: "outlined",
    inputSize: "sm",
    placeholder: "Placeholder",
  },
}

export const OutlinedMd: Story = {
  args: {
    variant: "outlined",
    inputSize: "md",
    placeholder: "Placeholder",
  },
}

export const NumberField: Story = {
  args: {
    variant: "number",
    placeholder: "0",
    defaultValue: "16",
  },
}

export const TextareaDefault: Story = {
  render: () => <Textarea placeholder="Enter text..." size="md" />,
}

export const TextareaSm: Story = {
  render: () => <Textarea placeholder="Enter text..." size="sm" />,
}
