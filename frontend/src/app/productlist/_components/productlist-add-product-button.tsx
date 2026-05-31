import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductListAddProductButtonProps {
  onClick?: () => void
}

export function ProductListAddProductButton({ onClick }: ProductListAddProductButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-40 md:bottom-24 md:right-8",
        "lg:bottom-[120px] lg:right-[clamp(24px,6.25vw,120px)]",
        "flex h-11 w-[7.25rem] items-center justify-center rounded-full lg:h-12 lg:w-28",
        "bg-[var(--secondary-illustration-06)] text-white shadow-lg",
        "transition-transform hover:translate-y-[-2px] hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--secondary-illustration-06)]"
      )}
      aria-label="상품 등록"
    >
      <Plus className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden="true" />
      <span className="text-sm font-semibold lg:text-base">상품 등록</span>
    </button>
  )
}

