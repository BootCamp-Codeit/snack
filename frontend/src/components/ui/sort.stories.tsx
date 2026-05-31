import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { Sort, SortDropdownList } from "./sort"

const sortOptions = ["최신순", "판매순", "낮은가격순", "높은가격순"]

const meta: Meta<typeof Sort> = {
  title: "UI/Sort",
  component: Sort,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "radio",
      options: ["md", "sm"],
    },
    label: {
      control: "text",
    },
  },
  args: {
    label: "최신순",
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: "md",
  },
}

export const Mobile: Story = {
  args: {
    size: "sm",
  },
}

export const WithDropdownList: Story = {
  render: () => (
    <div className="flex items-start gap-12">
      <SortDropdownList size="md" options={sortOptions} />
      <SortDropdownList size="sm" options={sortOptions} />
    </div>
  ),
}
