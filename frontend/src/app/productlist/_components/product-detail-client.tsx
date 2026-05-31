"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { CONTENT_PADDING_X } from "@/components/header"
import { Button } from "@/components/ui/button"
import { useAuthHeader } from "@/hooks/use-auth-header"
import { ApiError, deleteProduct, getCategories, getProductById } from "../_lib/api"
import type { CatalogCategory, Product } from "../_lib/types"
import { ProductDetailPurchaseSection } from "./product-detail-purchase-section"
import { ProductListGlobalHeader } from "./productlist-global-header"
import { ProductRegisterModal } from "./product-register-modal"

interface ProductDetailClientProps {
  productId: number
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const router = useRouter()
  const { role } = useAuthHeader()
  const canManage = role === "admin" || role === "superAdmin"

  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [authRequired, setAuthRequired] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [catalogRows, setCatalogRows] = useState<CatalogCategory[]>([])
  const [manageError, setManageError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reloadProduct = useCallback(async () => {
    setLoadError(null)
    setAuthRequired(false)
    try {
      const p = await getProductById(productId)
      setProduct(p)
      if (p) {
        setLoadError(null)
      } else {
        setLoadError("상품을 찾을 수 없습니다.")
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setAuthRequired(true)
        setProduct(null)
        setLoadError("로그인이 필요합니다.")
      } else {
        setProduct(null)
        setLoadError(
          e instanceof Error ? e.message : "상품을 불러오지 못했습니다.",
        )
      }
    }
  }, [productId])

  const refreshCategories = useCallback(async () => {
    try {
      const rows = await getCategories()
      setCatalogRows(rows)
    } catch {
      setCatalogRows([])
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = await getCategories()
        if (!cancelled) setCatalogRows(rows)
      } catch {
        if (!cancelled) setCatalogRows([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setProduct(undefined)
    void reloadProduct()
  }, [reloadProduct])

  const handleDelete = async () => {
    if (!product) return
    if (!window.confirm("이 상품을 삭제(비활성)할까요?")) return
    setManageError(null)
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      router.push("/productlist")
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setManageError("삭제 권한이 없습니다.")
      } else {
        setManageError(
          e instanceof Error ? e.message : "삭제에 실패했습니다.",
        )
      }
    } finally {
      setDeleting(false)
    }
  }

  if (product === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F4]">
        <ProductListGlobalHeader />
        <main className={`flex-1 py-10 ${CONTENT_PADDING_X}`}>
          <p className="mx-auto max-w-4xl text-sm text-gray-500">
            상품 정보를 불러오는 중입니다.
          </p>
        </main>
      </div>
    )
  }

  if (!product || loadError) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF8F4]">
        <ProductListGlobalHeader />
        <main className={`flex-1 py-10 ${CONTENT_PADDING_X}`}>
          <section className="mx-auto max-w-4xl space-y-4">
            <Link
              href="/productlist"
              className="text-xs font-medium text-gray-500 hover:text-gray-700 lg:text-sm"
            >
              ← 목록으로
            </Link>
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {loadError ?? "상품을 찾을 수 없습니다."}
            </p>
            {authRequired ? (
              <Button variant="solid" asChild className="rounded-xl">
                <Link href="/login">로그인하기</Link>
              </Button>
            ) : null}
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F4]">
      <ProductListGlobalHeader />

      <main className={`flex-1 py-6 md:py-8 lg:py-10 ${CONTENT_PADDING_X}`}>
        <section className="mx-auto max-w-4xl">
          <Link
            href="/productlist"
            className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 lg:text-sm"
          >
            ← 목록으로
          </Link>

          {canManage ? (
            <div className="mx-3 mt-4 flex flex-wrap gap-2 lg:mx-0">
              <Button
                type="button"
                variant="outlined"
                className="rounded-xl"
                onClick={() => {
                  setManageError(null)
                  setEditOpen(true)
                }}
              >
                수정
              </Button>
              <Button
                type="button"
                variant="outlined"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? "삭제 중…" : "삭제"}
              </Button>
            </div>
          ) : null}

          {manageError ? (
            <p className="mx-3 mt-2 text-sm text-red-600 lg:mx-0">{manageError}</p>
          ) : null}

          <div className="mx-3 mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white lg:mx-0 lg:mt-6 lg:rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200" />
                )}
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500 lg:text-sm">{product.category}</p>
                  <span className="rounded-full bg-[var(--secondary-illustration-02)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--primary-orange-400)] lg:px-3 lg:py-1 lg:text-xs">
                    {product.purchaseCount}회 구매
                  </span>
                </div>

                <h1 className="mt-2 text-xl font-bold text-gray-900 lg:mt-3 lg:text-2xl">
                  {product.name}
                </h1>

                <p className="mt-4 text-2xl font-extrabold text-gray-900 lg:mt-6 lg:text-3xl">
                  {product.price.toLocaleString()}원
                </p>

                <ProductDetailPurchaseSection
                  productId={product.id}
                  productName={product.name}
                  unitPrice={product.price}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <ProductRegisterModal
        open={editOpen}
        onOpenChange={setEditOpen}
        catalogRows={catalogRows}
        mode="edit"
        initialProduct={product}
        onSuccess={() => void reloadProduct()}
        onCategoriesRefresh={() => void refreshCategories()}
      />
    </div>
  )
}
