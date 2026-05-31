import * as React from "react"

import { cn } from "@/lib/utils"

interface ProductCardProps extends React.ComponentProps<"div"> {
  image: string;
  category: string;
  purchaseCount: number;
  name: string;
  price: number;
}

function ProductCard({
  className,
  image,
  category,
  purchaseCount,
  name,
  price,
  ...props
}: ProductCardProps) {
  return (
    <div
      data-slot="product-card"
      className={cn(
        "w-[327px] rounded-[20px] overflow-hidden bg-white shadow-sm border border-gray-100",
        className
      )}
      {...props}
    >
      <div className="w-full h-[327px] bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{category}</span>
          <span className="px-3 py-1 bg-[#FDF0DF] text-[#E5762C] text-xs font-medium rounded-full">
            {purchaseCount}회 구매
          </span>
        </div>
        
        <h3 className="text-base font-medium text-gray-900 mb-2">{name}</h3>
        
        <p className="text-xl font-bold text-gray-900">
          {price.toLocaleString()}원
        </p>
      </div>
    </div>
  )
}

interface ProductCardWithLikeProps extends ProductCardProps {
  isLiked?: boolean;
  onLikeToggle?: () => void;
}

function ProductCardWithLike({
  className,
  image,
  category,
  purchaseCount,
  name,
  price,
  isLiked = false,
  onLikeToggle,
  ...props
}: ProductCardWithLikeProps) {
  return (
    <div
      data-slot="product-card-with-like"
      className={cn(
        "w-[327px] rounded-[20px] overflow-hidden bg-white shadow-sm border border-gray-100",
        className
      )}
      {...props}
    >
      <div className="relative w-full h-[327px] bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
        <button
          onClick={onLikeToggle}
          className="absolute top-4 right-4 p-2 transition-colors cursor-pointer"
          aria-label={isLiked ? "좋아요 취소" : "좋아요"}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={isLiked ? "#EF4444" : "none"}
            stroke={isLiked ? "#EF4444" : "#D1D5DB"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{category}</span>
          <span className="px-3 py-1 bg-[#FDF0DF] text-[#E5762C] text-xs font-medium rounded-full">
            {purchaseCount}회 구매
          </span>
        </div>
        
        <h3 className="text-base font-medium text-gray-900 mb-2">{name}</h3>
        
        <p className="text-xl font-bold text-gray-900">
          {price.toLocaleString()}원
        </p>
      </div>
    </div>
  )
}

export { ProductCard, ProductCardWithLike }
export type { ProductCardProps, ProductCardWithLikeProps }
