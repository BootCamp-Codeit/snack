"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  className?: string;
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl bg-white py-16 md:py-24",
        className
      )}
    >
      <div className="relative mb-6 h-[160px] w-[200px] md:h-[200px] md:w-[240px]">
        <Image
          src="/assets/purchase_request_details/no_inquiry.png"
          alt=""
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      <h2 className="mb-2 text-center text-lg font-bold text-gray-900 md:text-xl">
        구매 요청한 내역이 없어요
      </h2>
      <p className="text-center text-sm text-gray-600 md:text-base">
        상품 리스트를 둘러보고 관리자에게 요청해보세요!
      </p>
    </div>
  );
}
