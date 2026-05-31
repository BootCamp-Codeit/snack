"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import Image from "next/image"

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-transparent py-1 shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "h-9 px-3 text-base md:text-sm",
        outlined:
          "font-[Pretendard] font-normal text-[#ABABAB] placeholder:text-[#ABABAB] border border-input",
        search: "border-0 bg-transparent focus-visible:ring-0",
        number:
          "text-right font-[Pretendard] font-normal text-[#ABABAB] placeholder:text-[#ABABAB] border border-input",
      },
      size: {
        sm: "",
        md: "",
      },
    },
    compoundVariants: [
      { variant: "default", size: "sm", class: "h-9 px-3 text-sm" },
      { variant: "default", size: "md", class: "h-10 px-3 text-base" },
      {
        variant: "outlined",
        size: "sm",
        class: "h-[54px] w-[327px] px-3 text-sm",
      },
      {
        variant: "outlined",
        size: "md",
        class: "h-[64px] w-[640px] px-3 text-[20px]",
      },
      {
        variant: "search",
        size: "sm",
        class: "h-[54px] w-[260px] pl-10 pr-10 text-sm",
      },
      {
        variant: "search",
        size: "md",
        class: "h-[64px] w-[560px] pl-12 pr-20 text-base",
      },
      {
        variant: "number",
        size: "sm",
        class: "h-[64px] w-[160px] px-3 text-sm",
      },
      {
        variant: "number",
        size: "md",
        class: "h-[64px] w-[160px] px-3 text-base",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const textareaVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 font-[Pretendard] font-normal resize-none",
  {
    variants: {
      size: {
        sm: "h-[160px] w-[327px] text-sm",
        md: "h-[160px] w-[640px] text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

type InputProps = React.ComponentProps<"input"> & {
  variant?: "default" | "outlined" | "search" | "number"
  inputSize?: "sm" | "md"
}

function Input({
  className,
  type = "text",
  variant = "default",
  inputSize = "md",
  ...props
}: InputProps) {
  if (variant === "search") {
    return (
      <InputWithSearchIcon
        className={className}
        type={type}
        inputSize={inputSize}
        {...props}
      />
    )
  }

  if (variant === "number") {
    return (
      <div className={cn("relative inline-flex items-center rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50", "h-[64px] w-[160px]")}>
        <input
          type="number"
          data-slot="input"
          data-variant={variant}
          data-size={inputSize}
          className={cn(
            "h-full w-full min-w-0 rounded-md border-0 bg-transparent py-1 pr-8 text-right outline-none focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-50 font-[Pretendard] font-normal text-[#ABABAB] placeholder:text-[#ABABAB] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className
          )}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 text-[#ABABAB] font-[Pretendard] font-normal text-sm">개</span>
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-size={inputSize}
      className={cn(inputVariants({ variant, size: inputSize, className }))}
      {...props}
    />
  )
}

function InputWithSearchIcon({
  className,
  inputSize = "md",
  value,
  defaultValue,
  onChange,
  ...props
}: React.ComponentProps<"input"> & {
  inputSize?: "sm" | "md"
}) {
  const [internalValue, setInternalValue] = React.useState(
    (defaultValue as string) ?? ""
  )
  const isControlled = value !== undefined
  const currentValue = isControlled ? (value as string) : internalValue
  const hasValue = currentValue.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value)
    onChange?.(e)
  }

  const handleClear = () => {
    if (!isControlled) setInternalValue("")
    onChange?.({
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  const searchIconSrc = inputSize === "sm" ? "/assets/icons/ic_search-sm.svg" : "/assets/icons/ic_search-md.svg"
  const clearIconSrc = inputSize === "sm" ? "/assets/icons/ic_X-circle-sm.svg" : "/assets/icons/ic_X-circle-md.svg"
  const iconSizeClass = inputSize === "sm" ? "size-6" : "size-9"

  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        inputSize === "sm" && "h-[54px] w-[260px]",
        inputSize === "md" && "h-[64px] w-[560px]"
      )}
    >
      {!hasValue && (
        <span
          className={cn(
            "pointer-events-none absolute left-3 flex text-input",
            iconSizeClass
          )}
        >
          <img src={searchIconSrc} alt="" className={iconSizeClass} aria-hidden />
        </span>
      )}
      <input
        type="text"
        role="searchbox"
        data-slot="input"
        data-variant="search"
        data-size={inputSize}
        value={currentValue}
        onChange={handleChange}
        className={cn(
          inputVariants({ variant: "search", size: inputSize, className }),
          hasValue && inputSize === "sm" && "pl-3 pr-16",
          hasValue && inputSize === "md" && "pl-3 pr-20"
        )}
        {...props}
      />
      {hasValue && (
        <span className="absolute right-3 flex items-center gap-1">
          <button type="button" onClick={handleClear} className="flex text-input hover:opacity-80">
            <Image src={clearIconSrc} alt="" width={24} height={24} className={iconSizeClass} aria-hidden />
          </button>
          <span className={cn("flex text-input", iconSizeClass)}>
            <Image src={searchIconSrc} alt="" width={24} height={24} className={iconSizeClass} aria-hidden />
          </span>
        </span>
      )}
    </div>
  )
}

function Textarea({
  className,
  size = "md",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-size={size}
      className={cn(textareaVariants({ size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants, Textarea, textareaVariants }
