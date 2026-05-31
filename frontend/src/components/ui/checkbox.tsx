"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

const checkboxVariants = cva(
  "shrink-0 border transition-colors flex items-center justify-center pointer-events-none [&_svg]:opacity-0 peer-checked:[&_svg]:opacity-100",
  {
    variants: {
      variant: {
        checkbox01:
          "rounded-full border-2 border-[#C4C4C4] bg-transparent peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
        checkbox02:
          "rounded-[4px] border-input bg-transparent peer-checked:border-orange-500 peer-checked:bg-orange-500 peer-checked:text-white peer-disabled:border-input peer-disabled:bg-white",
      },
      size: {
        sm: "size-6",
        md: "size-8",
      },
    },
    compoundVariants: [
      { variant: "checkbox01", size: "sm", class: "size-6" },
      { variant: "checkbox01", size: "md", class: "size-8" },
      { variant: "checkbox02", size: "sm", class: "size-6" },
      { variant: "checkbox02", size: "md", class: "size-8" },
    ],
    defaultVariants: {
      variant: "checkbox01",
      size: "sm",
    },
  }
)

const checkmarkSizes = {
  sm: "size-3.5",
  md: "size-5",
} as const

type CheckboxProps = React.ComponentProps<"input"> & {
  variant?: "checkbox01" | "checkbox02"
  checkboxSize?: "sm" | "md"
  label?: React.ReactNode
}

function Checkbox({
  className,
  variant = "checkbox01",
  checkboxSize = "sm",
  label,
  id: idProp,
  type: _type,
  ...props
}: CheckboxProps) {
  const id = React.useId()
  const inputId = idProp ?? id

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer",
        props.disabled && "cursor-not-allowed"
      )}
    >
      <span className="relative flex">
        <Input
          type="checkbox"
          id={inputId}
          data-slot="checkbox"
          data-variant={variant}
          data-size={checkboxSize}
          className="peer sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        <span
          className={cn(checkboxVariants({ variant, size: checkboxSize }), className)}
          aria-hidden
        >
          <CheckIcon className={checkmarkSizes[checkboxSize]} />
        </span>
      </span>
      {label != null && (
        <span
          className={cn(
            "text-sm text-muted-foreground select-none",
            props.disabled && "opacity-50"
          )}
        >
          {label}
        </span>
      )}
    </label>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M1 5.5L4.5 9L11 1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { Checkbox, checkboxVariants }
