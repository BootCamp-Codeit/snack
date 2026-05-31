"use client"

import type { Category, SubCategory } from "@/types/category"
import { cn } from "@/lib/utils"
import { PRODUCT_LIST_MAIN_PADDING_X } from "../_lib/layout"

interface ProductListFiltersProps {
  categories: Category[]
  subCategories: SubCategory[]
  selectedCategoryId: number | null
  selectedSubCategoryId: number | null
  onSelectCategory: (categoryId: number | null) => void
  onSelectSubCategory: (subCategoryId: number | null) => void
}

/** 본문(`page`의 패딩 + `max-w-[1680px]`)과 동일: 패딩은 바깥, 안쪽은 1680만 — 이중 들여쓰기 제거 */
const barRowPadClass = PRODUCT_LIST_MAIN_PADDING_X

const barTrackClass =
  "mx-auto flex h-16 w-full max-w-[1680px] items-center justify-start gap-3 overflow-x-auto"

const tabBtnClass =
  "relative shrink-0 px-4 py-[14px] font-[Pretendard] text-[18px] leading-[26px] transition-colors"

const chipBtnClass =
  "shrink-0 rounded-full px-4 py-[14px] font-[Pretendard] text-[16px] leading-[26px] transition-all"

export function ProductListFilters({
  categories,
  subCategories,
  selectedCategoryId,
  selectedSubCategoryId,
  onSelectCategory,
  onSelectSubCategory,
}: ProductListFiltersProps) {
  const isAllSelected = selectedCategoryId === null

  return (
    <section className="w-full divide-y divide-gray-200 border-b border-gray-200 bg-[#FBF8F4]">
      {/* 대분류 */}
      <div>
        <div className={barRowPadClass}>
          <div className={barTrackClass}>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className={cn(
                tabBtnClass,
                isAllSelected
                  ? "font-bold text-orange-500"
                  : "font-medium text-[var(--gray-gray-400,#ABABAB)] hover:text-gray-600",
              )}
            >
              전체
              {isAllSelected ? (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500" />
              ) : null}
            </button>

            {categories.map((c) => {
              const isSelected = selectedCategoryId === c.id
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className={cn(
                    tabBtnClass,
                    isSelected
                      ? "font-bold text-orange-500"
                      : "font-medium text-[var(--gray-gray-400,#ABABAB)] hover:text-gray-600",
                  )}
                >
                  {c.name}
                  {isSelected ? (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-orange-500" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 소분류 */}
      {selectedCategoryId !== null && subCategories.length > 0 ? (
        <div>
          <div className={barRowPadClass}>
            <div className={barTrackClass}>
              <button
                type="button"
                onClick={() => onSelectSubCategory(null)}
                className={cn(
                  chipBtnClass,
                  selectedSubCategoryId === null
                    ? "bg-orange-50 font-semibold text-orange-600"
                    : "font-medium text-[var(--gray-gray-400,#ABABAB)] hover:bg-gray-50",
                )}
              >
                전체보기
              </button>

              {subCategories.map((s) => {
                const isSelected = selectedSubCategoryId === s.id
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => onSelectSubCategory(s.id)}
                    className={cn(
                      chipBtnClass,
                      isSelected
                        ? "bg-orange-50 font-semibold text-orange-600"
                        : "font-medium text-[var(--gray-gray-400,#ABABAB)] hover:bg-gray-50",
                    )}
                  >
                    {s.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
