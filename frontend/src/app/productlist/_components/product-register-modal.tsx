"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogField,
  DialogFooter,
  DialogHeader,
  DialogInput,
  DialogLabel,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiError, createProduct, updateProduct } from "../_lib/api"
import type { CatalogCategory, Product } from "../_lib/types"
import { CategoryManageModal } from "./category-manage-modal"

/** 숫자만 반영해 천 단위 콤마로 표시 */
function formatPriceInputValue(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  const n = Number(digits)
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("ko-KR")
}

function parsePriceFromInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, "")
  return digits === "" ? NaN : Number(digits)
}

interface ProductRegisterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalogRows: CatalogCategory[]
  mode?: "create" | "edit"
  initialProduct?: Product | null
  onSuccess?: () => void
  /** 카테고리 관리 모달에서 변경 후 목록·필터용 카탈로그 갱신 */
  onCategoriesRefresh?: () => void
}

function CategorySelect({
  catalogRows,
  selectedMainId,
  selectedSubId,
  onMainChange,
  onSubChange,
}: {
  catalogRows: CatalogCategory[]
  selectedMainId: number | null
  selectedSubId: number | null
  onMainChange: (id: number | null) => void
  onSubChange: (id: number | null) => void
}) {
  const roots = catalogRows
    .filter((r) => r.parentId === null)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)

  const subs = selectedMainId
    ? catalogRows
        .filter((r) => r.parentId === selectedMainId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id)
    : []

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      <div className="relative min-w-0 flex-1">
        <select
          value={selectedMainId ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onMainChange(val ? Number(val) : null)
            onSubChange(null)
          }}
          className={cn(
            "h-[50px] w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-[#E5762C] focus:outline-none focus:ring-1 focus:ring-[#E5762C]",
            selectedMainId ? "text-[#E5762C]" : "text-gray-400",
          )}
        >
          <option value="">대분류</option>
          {roots.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#E5762C]" />
      </div>
      <div className="relative min-w-0 flex-1">
        <select
          value={selectedSubId ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onSubChange(val ? Number(val) : null)
          }}
          disabled={!selectedMainId}
          className={cn(
            "h-[50px] w-full appearance-none rounded-[12px] border border-gray-200 bg-white px-4 pr-10 text-sm focus:border-[#E5762C] focus:outline-none focus:ring-1 focus:ring-[#E5762C] disabled:opacity-50",
            selectedSubId ? "text-[#E5762C]" : "text-gray-400",
          )}
        >
          <option value="">소분류 (선택)</option>
          {subs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-[#E5762C]" />
      </div>
    </div>
  )
}

function resolveMainSubFromCategoryId(
  rows: CatalogCategory[],
  categoryId: number | null | undefined,
): { main: number | null; sub: number | null } {
  if (categoryId == null || !Number.isFinite(categoryId)) {
    return { main: null, sub: null }
  }
  const row = rows.find((r) => r.id === categoryId)
  if (!row) return { main: null, sub: null }
  if (row.parentId == null) {
    return { main: row.id, sub: null }
  }
  return { main: row.parentId, sub: row.id }
}

export function ProductRegisterModal({
  open,
  onOpenChange,
  catalogRows,
  mode = "create",
  initialProduct = null,
  onSuccess,
  onCategoriesRefresh,
}: ProductRegisterModalProps) {
  const [name, setName] = useState("")
  const [priceStr, setPriceStr] = useState("")
  const [imageKey, setImageKey] = useState("")
  const [productUrl, setProductUrl] = useState("")
  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null)
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [categoryManageOpen, setCategoryManageOpen] = useState(false)

  const resetForm = useCallback(() => {
    setName("")
    setPriceStr("")
    setImageKey("")
    setProductUrl("")
    setMainCategoryId(null)
    setSubCategoryId(null)
    setSubmitError(null)
  }, [])

  const prevOpen = useRef(false)

  useEffect(() => {
    if (open && !prevOpen.current) {
      setSubmitError(null)
      if (mode === "edit" && initialProduct) {
        setName(initialProduct.name)
        setPriceStr(
          formatPriceInputValue(String(Math.round(initialProduct.price))),
        )
        setImageKey(initialProduct.imageKey?.trim() ?? "")
        setProductUrl(initialProduct.productUrl?.trim() ?? "")
        const { main, sub } = resolveMainSubFromCategoryId(
          catalogRows,
          initialProduct.categoryId,
        )
        setMainCategoryId(main)
        setSubCategoryId(sub)
      } else if (mode === "create") {
        resetForm()
      }
    }
    prevOpen.current = open
  }, [open, mode, initialProduct, catalogRows, resetForm])

  useEffect(() => {
    if (!open) setCategoryManageOpen(false)
  }, [open])

  const handleClose = () => {
    setCategoryManageOpen(false)
    onOpenChange(false)
    resetForm()
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    const trimmedName = name.trim()
    if (!trimmedName) {
      setSubmitError("상품명을 입력해주세요.")
      return
    }
    const price = parsePriceFromInput(priceStr)
    if (!Number.isFinite(price) || price < 0) {
      setSubmitError("올바른 가격을 입력해주세요.")
      return
    }

    const categoryId = subCategoryId ?? mainCategoryId ?? null

    const payload = {
      name: trimmedName,
      price,
      categoryId,
      imageKey: imageKey.trim() || null,
      productUrl: productUrl.trim() || null,
    }

    setSubmitting(true)
    try {
      if (mode === "edit" && initialProduct) {
        await updateProduct(initialProduct.id, payload)
      } else {
        await createProduct({ ...payload, isActive: true })
      }
      onSuccess?.()
      handleClose()
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setSubmitError("등록·수정 권한이 없습니다. (관리자 이상 필요)")
      } else if (e instanceof ApiError) {
        setSubmitError(e.message)
      } else {
        setSubmitError(
          e instanceof Error ? e.message : "저장에 실패했습니다.",
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,90vh)] w-full max-w-[500px] overflow-y-auto p-6 lg:p-8">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "상품 수정" : "상품 등록"}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {submitError ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {submitError}
            </p>
          ) : null}

          <DialogField>
            <DialogLabel>상품명</DialogLabel>
            <DialogInput
              placeholder="상품명을 입력해주세요."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </DialogField>

          <DialogField>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <DialogLabel className="mb-0">카테고리</DialogLabel>
              <Button
                type="button"
                variant="outlined"
                className="h-9 shrink-0 rounded-[10px] px-3 text-xs whitespace-nowrap"
                onClick={() => setCategoryManageOpen(true)}
              >
                카테고리 관리
              </Button>
            </div>
            <CategorySelect
              catalogRows={catalogRows}
              selectedMainId={mainCategoryId}
              selectedSubId={subCategoryId}
              onMainChange={setMainCategoryId}
              onSubChange={setSubCategoryId}
            />
          </DialogField>

          <DialogField>
            <DialogLabel>가격</DialogLabel>
            <DialogInput
              placeholder="가격을 입력해주세요."
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={priceStr}
              onChange={(e) =>
                setPriceStr(formatPriceInputValue(e.target.value))
              }
            />
          </DialogField>

          <DialogField>
            <DialogLabel>이미지 키 (선택)</DialogLabel>
            <DialogInput
              placeholder="백엔드 스토리지 키 또는 URL"
              value={imageKey}
              onChange={(e) => setImageKey(e.target.value)}
            />
          </DialogField>

          <DialogField>
            <DialogLabel>제품 링크 (선택)</DialogLabel>
            <DialogInput
              placeholder="https://..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
            />
          </DialogField>
        </DialogBody>

        <DialogFooter className="mt-8 flex gap-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outlined"
              className="h-[50px] flex-1 rounded-[12px]"
              onClick={handleClose}
              disabled={submitting}
            >
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="solid"
            className="h-[50px] flex-1 rounded-[12px]"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {mode === "edit" ? "저장" : "등록하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <CategoryManageModal
      open={categoryManageOpen}
      onOpenChange={setCategoryManageOpen}
      catalogRows={catalogRows}
      nested
      onSuccess={() => {
        onCategoriesRefresh?.()
      }}
    />
    </>
  )
}
