"use client"

import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import type { Product } from "../_lib/types"

/** 상품 리스트: 카드 402×558(이미지+24px+정보), 모서리 라운드는 이미지 영역만 */
export function ProductListProductCard({
  product,
  className,
  ...props
}: { product: Product } & ComponentProps<"div">) {
  const { image, category, purchaseCount, name, price } = product
  return (
    <div
      data-slot="productlist-product-card"
      className={cn(
        "flex w-full max-w-[402px] flex-col gap-6 bg-transparent min-[431px]:h-[558px] min-[431px]:w-[402px] min-[431px]:max-w-none",
        className,
      )}
      {...props}
    >
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-[20px] border border-gray-100 bg-gray-100 shadow-sm min-[431px]:aspect-auto min-[431px]:h-[402px]">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>

      <div className="flex min-h-0 flex-col bg-transparent min-[431px]:min-h-0 min-[431px]:flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-gray-500 min-[431px]:text-sm">{category}</span>
          <span className="shrink-0 rounded-none bg-[#FDF0DF] px-2 py-0.5 text-[10px] font-medium text-[#E5762C] min-[431px]:px-3 min-[431px]:py-1 min-[431px]:text-xs">
            {purchaseCount}회 구매
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 font-[Pretendard] text-[16px] font-semibold leading-[26px] text-[var(--black-black-400,#1F1F1F)] min-[431px]:text-[20px] min-[431px]:leading-[32px]">
          {name}
        </h3>

        <p className="font-[Pretendard] text-[22px] font-bold leading-[30px] text-[var(--black-black-400,#1F1F1F)] min-[431px]:text-[32px] min-[431px]:leading-[42px]">
          {price.toLocaleString()}원
        </p>
      </div>
    </div>
  )
}
