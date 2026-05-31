import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const sortVariants = cva(
  "relative inline-flex items-center justify-start rounded-[8px] border border-[#E6E6E6] bg-white font-['Pretendard'] text-[#9F9F9F] not-italic font-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        md: "h-[50px] w-[136px] px-[14px] py-[12px] text-[18px] leading-none",
        sm: "h-[36px] w-[87px] px-[8px] py-[6px] text-[14px] leading-none",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const iconSizeClassMap = {
  md: "right-3 size-6",
  sm: "right-2 size-4",
} as const

type SortProps = React.ComponentProps<"button"> &
  VariantProps<typeof sortVariants> & {
    label?: string
  }

type SortSize = NonNullable<VariantProps<typeof sortVariants>["size"]>

function Sort({
  className,
  size,
  label = "최신순",
  ...props
}: SortProps) {
  const resolvedSize: SortSize = size ?? "md"

  return (
    <button
      type="button"
      data-slot="sort"
      data-size={resolvedSize}
      className={cn(sortVariants({ size: resolvedSize, className }))}
      {...props}
    >
      <span className="w-full truncate pr-6 text-left">
        {label}
      </span>
      <ChevronDown
        className={cn("absolute shrink-0 text-[#A0A0A0]", iconSizeClassMap[resolvedSize])}
      />
    </button>
  )
}

const sortDropdownListVariants = cva(
  "flex flex-col rounded-2xl border border-[#E6E6E6] bg-white py-2 text-[#9F9F9F]",
  {
    variants: {
      size: {
        md: "w-[136px]",
        sm: "w-[87px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const sortDropdownItemVariants = cva(
  "w-full whitespace-nowrap text-left font-['Pretendard'] not-italic font-normal transition-colors hover:bg-[#F6F6F6]",
  {
    variants: {
      size: {
        md: "px-3.5 py-3 text-[18px] leading-tight",
        sm: "px-2 py-2 text-[14px] leading-tight",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type SortDropdownListProps = React.ComponentProps<"div"> &
  VariantProps<typeof sortDropdownListVariants> & {
    options: string[]
  }

function SortDropdownList({
  className,
  size,
  options,
  ...props
}: SortDropdownListProps) {
  const resolvedSize: SortSize = size ?? "md"

  return (
    <div
      data-slot="sort-dropdown-list"
      data-size={resolvedSize}
      className={cn(sortDropdownListVariants({ size: resolvedSize, className }))}
      {...props}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(sortDropdownItemVariants({ size: resolvedSize }))}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export { Sort, SortDropdownList, sortVariants }

