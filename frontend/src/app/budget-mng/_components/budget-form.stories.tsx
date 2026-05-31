import type { Meta, StoryObj } from "@storybook/react"

import { BudgetForm } from "./budget-form"

const meta: Meta<typeof BudgetForm> = {
  title: "App/BudgetMng/BudgetForm",
  component: BudgetForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-[90vw]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BudgetForm>

export const Default: Story = {
  args: { size: "md" },
}

export const Small: Story = {
  args: { size: "sm" },
}
