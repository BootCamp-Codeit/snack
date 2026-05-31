"use client"

import type { ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Sort } from "@/components/ui/sort"
import { cn } from "@/lib/utils"
import type { SortOption } from "../_lib/types"

type SortOptionItem = { value: SortOption; label: string }

interface ProductListHeaderProps {
  keyword: string
  onChangeKeyword: (value: string) => void
  sortLabel: string
  sortOptions: readonly SortOptionItem[]
  selectedSort: SortOption
  onSelectSort: (value: SortOption) => void
  /** 검색 입력란 왼쪽에 표시 (예: 카테고리 관리 버튼) */
  searchLeading?: ReactNode
}

export function ProductListHeader({
  keyword,
  onChangeKeyword,
  sortLabel,
  sortOptions,
  selectedSort,
  onSelectSort,
  searchLeading,
}: ProductListHeaderProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (!containerRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    window.addEventListener("mousedown", handlePointerDown)
    return () => window.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  return (
    <header className="flex w-full flex-col items-end gap-3 md:flex-row md:items-center md:justify-end">
      <div className="flex w-full min-w-0 max-w-[560px] flex-col items-stretch gap-3 self-end md:w-auto md:max-w-none md:flex-row md:items-center md:gap-3">
        {searchLeading ? (
          <div className="shrink-0 self-start md:self-center">{searchLeading}</div>
        ) : null}

        {searchLeading ? (
          <div
            className={cn(
              "min-w-0 flex-1",
              "[&>div]:w-full [&>div]:max-w-full md:[&>div]:max-w-[560px]",
            )}
          >
            <Input
              variant="search"
              inputSize="sm"
              value={keyword}
              onChange={(event) => onChangeKeyword(event.target.value)}
              placeholder="상품명으로 검색하세요"
            />
          </div>
        ) : (
          <div className="min-w-0 w-full md:w-[min(100%,560px)] md:max-w-[560px]">
            <Input
              variant="search"
              inputSize="sm"
              value={keyword}
              onChange={(event) => onChangeKeyword(event.target.value)}
              placeholder="상품명으로 검색하세요"
            />
          </div>
        )}

        <div ref={containerRef} className="relative shrink-0 self-end md:self-auto">
          <Sort
            size="sm"
            label={sortLabel}
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="menu"
          />

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-10 mt-2 w-[180px] overflow-hidden rounded-2xl border border-[#E6E6E6] bg-white py-2 text-[#9F9F9F] shadow-sm"
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectSort(option.value)
                    setOpen(false)
                  }}
                  className={`w-full whitespace-nowrap px-3 py-2 text-left text-[14px] leading-tight transition-colors hover:bg-[#F6F6F6] ${
                    option.value === selectedSort
                      ? "bg-[#F6F6F6] font-semibold text-[#37352f]"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

