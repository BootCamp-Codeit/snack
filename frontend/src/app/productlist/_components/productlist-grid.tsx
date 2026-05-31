"use client"

import Link from "next/link"
import { useLayoutEffect, useRef, useState } from "react"
import { ProductListProductCard } from "./productlist-product-card"
import type { Product } from "../_lib/types"

/** 402×4 + 24×3 = 1680 — 측정 너비 기준 4열(뷰포트/스크롤바 오차 보정) */
const FOUR_COL_MIN_WIDTH = 1680

interface ProductListGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductListGrid({ products, loading = false }: ProductListGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [useFourCols, setUseFourCols] = useState(false)

  useLayoutEffect(() => {
    const el = gridRef.current
    if (!el) return

    const update = () => {
      const w = el.getBoundingClientRect().width
      setUseFourCols(w >= FOUR_COL_MIN_WIDTH - 0.5)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [products.length])

  return (
    <section className="mt-6 w-full min-w-0">
      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-sm text-gray-400">
          상품 정보를 불러오는 중입니다.
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-10 text-sm text-gray-400">
          조회된 상품이 없습니다.
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid w-full min-w-0 grid-cols-1 justify-items-center gap-x-6 gap-y-14 min-[431px]:justify-start min-[431px]:[grid-template-columns:repeat(auto-fill,402px)]"
          style={
            useFourCols
              ? { gridTemplateColumns: "repeat(4, minmax(0, 402px))" }
              : undefined
          }
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/productlist/${product.id}`}
              className="block w-full max-w-[402px] min-w-0 transition-transform hover:-translate-y-0.5 min-[431px]:w-[402px] min-[431px]:max-w-none"
            >
              <ProductListProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
