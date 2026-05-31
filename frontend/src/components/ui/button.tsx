import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[16px] font-medium whitespace-nowrap transition-all outline-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid Button - 주황색 배경
        solid:
          "bg-[#E5762C] text-white hover:bg-[#D16825]",
        // Solid Selected - 연한 주황색 배경 + 연한 테두리
        "solid-selected":
          "bg-orange-300 text-white border-2 border-orange-200",
        // Solid Disabled - gray-50 배경
        "solid-disabled":
          "bg-gray-50 text-gray-400 cursor-not-allowed",
        // Outlined Button - 주황색 테두리 + 주황색 텍스트
        outlined:
          "bg-transparent text-[#E5762C] border-2 border-[#E5762C] hover:bg-orange-50",
        // Outlined Selected - 흰색 배경 + 주황색 테두리
        "outlined-selected":
          "bg-white text-[#E5762C] border-2 border-[#E5762C]",
        // Outlined Disabled - 회색 테두리 + 회색 텍스트
        "outlined-disabled":
          "bg-transparent text-gray-400 border border-gray-200 cursor-not-allowed",
        // Etc Button - 흰색 배경 + 회색 테두리
        etc:
          "bg-white text-gray-500 border border-[#E0E0E0] hover:bg-gray-50",
        // Invite Button - 투명 배경 + 주황색 텍스트
        invite:
          "bg-transparent text-[#E5762C] hover:text-[#D16825]",
        // Social Login Icon - Google (흰색)
        "social-google":
          "bg-white hover:bg-gray-50",
        // Social Login Icon - Google Outlined (흰색 + 테두리)
        "social-google-outlined":
          "bg-white border border-gray-300 hover:bg-gray-50",
        // Social Login Icon - Kakao (노란색)
        "social-kakao":
          "bg-[#FEE500] hover:bg-[#FDD835]",
        // Social Login Icon - Naver (초록색)
        "social-naver":
          "bg-[#03C75A] hover:bg-[#02B350]",
        // Add Button - 초록색 배경
        add:
          "bg-[#64D396] text-white hover:bg-[#56C88A] shadow-[4px_0_10px_0_rgba(204,204,204,0.12),0_4px_8px_0_rgba(0,0,0,0.08)]",
      },
      size: {
        sm: "w-[327px] h-[54px] text-sm",
        lg: "w-[640px] h-[64px] text-base",
        "etc-sm": "w-[89px] h-[30px] text-xs rounded-[100px]",
        "etc-lg": "w-[139px] h-[50px] text-sm rounded-[100px]",
        invite: "h-auto px-0 text-[14px] font-semibold",
        "social-sm": "size-[48px] rounded-full p-0",
        "social-lg": "size-[64px] rounded-full p-0",
        "add-sm": "w-[120px] h-[54px] text-[16px] font-semibold rounded-[100px]",
        "add-lg": "w-[163px] h-[68px] text-[24px] font-semibold rounded-[100px]",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "sm",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
