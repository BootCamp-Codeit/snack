"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { hasStoredAccessToken } from "@/lib/auth/session-storage"
import { addCartItem, ApiError } from "../_lib/api"

/** 목업: 결제 예정 금액의 1%를 적립 포인트로 표시 */
const POINT_RATE = 0.01

interface ProductDetailPurchaseSectionProps {
  productId: number
  productName: string
  unitPrice: number
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-gray-100 py-2.5 text-xs last:border-b-0 lg:gap-4 lg:py-3 lg:text-sm">
      <span className="w-20 shrink-0 font-medium text-gray-500 lg:w-24">{label}</span>
      <div className="min-w-0 flex-1 text-gray-800">{children}</div>
    </div>
  )
}

export function ProductDetailPurchaseSection({
  productId,
  productName,
  unitPrice,
}: ProductDetailPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [cartError, setCartError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const lineTotal = unitPrice * quantity
  const expectedPoints = Math.floor(lineTotal * POINT_RATE)

  const bump = (delta: number) => {
    setQuantity((q) => Math.min(99, Math.max(1, q + delta)))
    setCartMessage(null)
    setCartError(null)
  }

  const handleAddToCart = async () => {
    setCartMessage(null)
    setCartError(null)
    if (!hasStoredAccessToken()) {
      setCartError("장바구니를 이용하려면 로그인해주세요.")
      return
    }
    setAdding(true)
    try {
      await addCartItem(productId, quantity)
      setCartMessage(
        `장바구니에 담았습니다: ${productName} × ${quantity}개 — 합계 ${lineTotal.toLocaleString()}원`,
      )
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setCartError("로그인이 만료되었습니다. 다시 로그인해주세요.")
      } else if (e instanceof ApiError && e.status === 403) {
        setCartError("장바구니에 담을 권한이 없습니다.")
      } else {
        setCartError(
          e instanceof Error ? e.message : "장바구니에 담지 못했습니다.",
        )
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="mt-6 space-y-4 lg:mt-8 lg:space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-1 lg:px-5">
        <DetailRow label="구매혜택">
          <span className="font-semibold text-[var(--primary-orange-400)]">
            {expectedPoints.toLocaleString()}포인트
          </span>{" "}
          적립 예정
        </DetailRow>
        <DetailRow label="배송방법">택배</DetailRow>
        <DetailRow label="배송비">
          3,000원 (50,000원 이상 구매 시 무료배송)
          <span className="mx-1.5 text-gray-400">|</span>
          도서산간 배송비 추가
        </DetailRow>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div
          className={cn(
            "flex h-14 w-full shrink-0 items-center justify-between rounded-xl border border-gray-200 bg-white px-4 sm:h-12 sm:w-[120px] lg:h-12",
          )}
        >
          <span className="text-sm font-bold text-[#E5762C] lg:text-base">
            {quantity}개
          </span>

          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              aria-label="수량 증가"
              className="flex h-5 w-6 items-center justify-center text-[#E5762C] hover:opacity-70 disabled:opacity-30 transition-opacity"
              disabled={quantity >= 99}
              onClick={() => bump(1)}
            >
              <ChevronUp className="size-4" strokeWidth={3} />
            </button>
            <button
              type="button"
              aria-label="수량 감소"
              className="flex h-5 w-6 items-center justify-center text-[#E5762C] hover:opacity-70 disabled:opacity-30 transition-opacity"
              disabled={quantity <= 1}
              onClick={() => bump(-1)}
            >
              <ChevronDown className="size-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <Button
          type="button"
          variant="solid"
          className="h-14 w-full shrink-0 rounded-2xl px-6 text-base font-semibold !w-full sm:h-12 sm:!w-auto sm:min-w-[200px] sm:flex-1 lg:text-base"
          onClick={() => void handleAddToCart()}
          disabled={adding}
        >
          {adding ? "담는 중…" : "장바구니 담기"}
        </Button>
      </div>
      <div className="flex justify-between border-t border-gray-100 pt-3 lg:pt-4">
        <span className="text-sm font-medium text-gray-900 lg:text-base">총 상품 금액</span>
        <span className="text-lg font-bold text-gray-900 lg:text-xl">{lineTotal.toLocaleString()}원</span>
      </div>
      {cartMessage ? (
        <p className="text-xs text-gray-600 lg:text-sm" role="status">
          {cartMessage}
        </p>
      ) : null}
      {cartError ? (
        <div className="space-y-2">
          <p className="text-xs text-red-600 lg:text-sm" role="alert">
            {cartError}
          </p>
          {cartError.includes("로그인") ? (
            <Button variant="outlined" asChild className="rounded-xl text-sm">
              <Link href="/login">로그인</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
