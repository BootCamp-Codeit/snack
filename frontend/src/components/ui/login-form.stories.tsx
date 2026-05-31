import type { Meta, StoryObj } from "@storybook/react"
import { LoginForm } from "./login-form"

const meta: Meta<typeof LoginForm> = {
  title: "UI/Molecules/LoginForm",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj<typeof LoginForm>

export const Default: Story = {
  args: { size: "md" },
}

export const Small: Story = {
  args: { size: "sm" },
}