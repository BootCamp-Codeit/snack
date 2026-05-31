import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Chip } from "./chip"

const meta: Meta<typeof Chip> = {
  title: "UI/Chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["cart", "user"],
    },
    selected: {
      control: "boolean",
      if: { arg: "variant", eq: "user" },
    },
    badgeCount: {
      control: { type: "number", min: 0, max: 99 },
      if: { arg: "variant", eq: "cart" },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

/** Cart 칩: 텍스트 + 선택적 주황 배지(숫자) */
export const Cart: Story = {
  args: {
    variant: "cart",
    children: "Cart",
    badgeCount: 2,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="bg-zinc-800 p-4 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

/** Cart 칩 – 배지 없음 */
export const CartWithoutBadge: Story = {
  ...Cart,
  args: {
    variant: "cart",
    children: "Cart",
    badgeCount: undefined,
  },
}

/** User 칩 – 기본 상태 (이미지 참고: 관리자 선택, 일반 비선택) */
export const UserDefault: Story = {
  render: () => (
    <div className="bg-zinc-800 p-4 rounded-lg flex gap-2">
      <Chip
        variant="user"
        selected
        className="bg-[#fdf0df] text-[#f97b22] hover:bg-[#fdf0df]"
      >
        관리자
      </Chip>
      <Chip
        variant="user"
        selected={false}
        className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100"
      >
        일반
      </Chip>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
}

/** User 칩 – 선택된 관리자만 단독으로 강조 */
export const UserSelected: Story = {
  render: () => (
    <div className="bg-zinc-800 p-4 rounded-lg flex gap-2">
      <Chip
        variant="user"
        selected
        className="bg-[#fdf0df] text-[#f97b22] hover:bg-[#fdf0df]"
      >
        관리자
      </Chip>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
}

/** Chip/user – 관리자·일반 조합 (User Default 스타일 확장) */
export const UserGroup: Story = {
  render: () => (
    <div className="bg-zinc-800 p-4 rounded-lg flex gap-2 flex-wrap">
      <Chip
        variant="user"
        selected
        className="bg-[#fdf0df] text-[#f97b22] hover:bg-[#fdf0df]"
      >
        관리자
      </Chip>
      <Chip
        variant="user"
        selected={false}
        className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100"
      >
        일반
      </Chip>
      <Chip
        variant="user"
        selected
        className="bg-[#fdf0df] text-[#f97b22] hover:bg-[#fdf0df]"
      >
        관리자
      </Chip>
      <Chip
        variant="user"
        selected={false}
        className="bg-zinc-100 text-zinc-400 hover:bg-zinc-100"
      >
        일반
      </Chip>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
}

/** Chip/cart – 배지 있는 메뉴 2개 */
export const CartGroup: Story = {
  render: () => (
    <div className="bg-zinc-800 p-4 rounded-lg flex gap-4">
      <Chip variant="cart" badgeCount={2}>
        Cart
      </Chip>
      <Chip variant="cart" badgeCount={2}>
        Cart
      </Chip>
    </div>
  ),
  parameters: {
    backgrounds: { default: "dark" },
  },
}
