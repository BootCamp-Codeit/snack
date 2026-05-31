"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-pressed:opacity-90",
  {
    variants: {
      variant: {
        cart:
          "text-white bg-transparent rounded-md [&_.chip-badge]:shrink-0",
        user:
          "rounded-full px-4 py-2 border border-transparent cursor-pointer select-none",
      },
      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "user",
        selected: false,
        class:
          "bg-zinc-600 text-white hover:bg-zinc-500 dark:bg-zinc-700 dark:hover:bg-zinc-600",
      },
      {
        variant: "user",
        selected: true,
        class:
          "bg-amber-100 text-black hover:bg-amber-200 dark:bg-amber-200/90 dark:text-black dark:hover:bg-amber-300/90",
      },
    ],
    defaultVariants: {
      variant: "cart",
      selected: false,
    },
  }
)

const chipBadgeClasses =
  "chip-badge inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-xs font-semibold text-white bg-orange-500"

export interface ChipProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof chipVariants> {
  asChild?: boolean
  /** cart variant용: 표시할 숫자(예: 장바구니 개수). 있으면 주황 배지로 표시 */
  badgeCount?: number
  /** user variant용: 선택 여부 */
  selected?: boolean
  children: React.ReactNode
}

function Chip({
  className,
  variant = "cart",
  selected = false,
  asChild = false,
  badgeCount,
  children,
  ...props
}: ChipProps) {
  const Comp = asChild ? Slot.Root : "button"
  const showBadge = variant === "cart" && badgeCount != null && badgeCount > 0

  return (
    <Comp
      data-slot="chip"
      data-variant={variant}
      data-selected={variant === "user" ? selected : undefined}
      aria-pressed={variant === "user" ? selected : undefined}
      role={variant === "user" ? "option" : undefined}
      className={cn(chipVariants({ variant, selected, className }))}
      {...props}
    >
      {children}
      {variant === "cart" && showBadge && (
        <span aria-label={`개수: ${badgeCount}`} className={chipBadgeClasses}>
          {badgeCount}
        </span>
      )}
    </Comp>
  )
}

export { Chip, chipVariants }
