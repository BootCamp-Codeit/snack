"use client"

import * as React from "react"
import Image from "next/image"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  toggleLabel?: string
}

export function PasswordInput({
  className,
  toggleLabel = "password visibility",
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        {...props}
        type={isVisible ? "text" : "password"}
        className={cn("pr-12 md:pr-14", className)}
      />
      <button
        type="button"
        onClick={() => setIsVisible((value) => !value)}
        aria-label={isVisible ? `Hide ${toggleLabel}` : `Show ${toggleLabel}`}
        className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#ABABAB] transition-opacity hover:opacity-80"
      >
        <Image
          src={
            isVisible
              ? "/assets/icons/visibility_on.svg"
              : "/assets/icons/visibility_off.svg"
          }
          alt=""
          width={24}
          height={24}
          aria-hidden
        />
      </button>
    </div>
  )
}
