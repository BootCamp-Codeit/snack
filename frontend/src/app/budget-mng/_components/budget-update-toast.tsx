"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CheckIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type BudgetUpdateToastVariant = "success" | "error"

type BudgetUpdateToastProps = {
  variant: BudgetUpdateToastVariant
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BudgetUpdateToast({
  variant,
  open,
  onOpenChange,
}: BudgetUpdateToastProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const onOpenChangeRef = React.useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  React.useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => onOpenChangeRef.current(false), 4500)
    return () => window.clearTimeout(id)
  }, [open])

  if (!mounted || !open) return null

  const node = (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex max-w-[min(100%,480px)] items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg",
          variant === "success" &&
            "border-[#F97B22]/25 bg-[#FFF8F3] text-[#F97B22]",
          variant === "error" &&
            "border-red-200 bg-red-50 text-red-600",
        )}
      >
        {variant === "success" ? (
          <>
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F97B22]"
              aria-hidden
            >
              <CheckIcon className="size-4 text-white" strokeWidth={3} />
            </span>
            <span className="text-sm font-medium">예산이 변경되었습니다.</span>
          </>
        ) : (
          <>
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white"
              aria-hidden
            >
              <XIcon className="size-4" strokeWidth={3} />
            </span>
            <span className="text-sm font-medium">
              (X) 예산변경에 실패하였습니다.
            </span>
          </>
        )}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn(
            "ml-1 shrink-0 rounded-full p-1 transition-opacity hover:opacity-80",
            variant === "success" && "text-[#F97B22]/70",
            variant === "error" && "text-red-400",
          )}
          aria-label="닫기"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
