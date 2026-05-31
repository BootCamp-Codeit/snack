"use client";

import { Sort } from "@/components/ui/sort";
import type { ProductSort } from "../_lib/types";

const SORT_OPTIONS: ProductSort[] = [
  "최신순",
  "낮은가격순",
  "높은가격순",
];

interface ProductRegisterHeaderProps {
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  isSortOpen: boolean;
  onSortOpenChange: (open: boolean) => void;
}

export function ProductRegisterHeader({
  sort,
  onSortChange,
  isSortOpen,
  onSortOpenChange,
}: ProductRegisterHeaderProps) {
  return (
    <header>
      <div className="flex flex-row items-center justify-between gap-2 min-[481px]:gap-3">
        <h1 className="min-w-0 text-xl font-bold leading-snug text-[#37352f] min-[481px]:text-3xl min-[481px]:leading-normal">
          상품 등록 내역
        </h1>
        <div
          className={[
            "relative shrink-0",
            "max-[480px]:[&_button[data-slot=sort]]:h-9 max-[480px]:[&_button[data-slot=sort]]:w-[102px]",
            "max-[480px]:[&_button[data-slot=sort]]:px-2 max-[480px]:[&_button[data-slot=sort]]:py-1.5",
            "max-[480px]:[&_button[data-slot=sort]]:text-[13px]",
            "max-[480px]:[&_button[data-slot=sort]_span]:pr-5",
            "max-[480px]:[&_button[data-slot=sort]_svg]:right-2 max-[480px]:[&_button[data-slot=sort]_svg]:size-4",
          ].join(" ")}
        >
          <Sort
            label={sort}
            size="md"
            onClick={() => onSortOpenChange(!isSortOpen)}
            aria-expanded={isSortOpen}
            aria-haspopup="listbox"
          />
          {isSortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => onSortOpenChange(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1">
                <div
                  role="listbox"
                  className="flex w-[136px] flex-col rounded-2xl border border-[#E6E6E6] bg-white py-2 shadow-sm max-[480px]:w-[102px] max-[480px]:rounded-xl max-[480px]:py-1.5"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="option"
                      aria-selected={opt === sort}
                      className={`w-full px-3.5 py-3 text-left text-[18px] transition-colors max-[480px]:px-2.5 max-[480px]:py-2 max-[480px]:text-[13px] ${
                        opt === sort
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-[#9F9F9F] hover:bg-[#F6F6F6]"
                      }`}
                      onClick={() => {
                        onSortChange(opt);
                        onSortOpenChange(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
