"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Category, SubCategory } from "@/types/category";

const scrollClass =
  "flex w-full gap-0 overflow-x-auto overflow-y-hidden py-0 md:gap-2 md:px-1 [&::-webkit-scrollbar]:[display:none] cursor-grab active:cursor-grabbing select-none";
const scrollStyle: React.CSSProperties = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  WebkitOverflowScrolling: "touch",
};

/** 마우스/터치 드래그로 가로 스크롤 + 클릭 시 탭 선택 유지 */
function useDragToScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startScrollLeft: number; didDrag: boolean } | null>(null);
  const blockClick = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (ref.current) {
      drag.current = {
        startX: e.clientX,
        startScrollLeft: ref.current.scrollLeft,
        didDrag: false,
      };
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!ref.current || !drag.current) return;
    const dx = e.clientX - drag.current.startX;
    if (e.pointerType === "mouse") {
      ref.current.scrollLeft = drag.current.startScrollLeft - dx;
    }
    if (Math.abs(dx) > 4) drag.current.didDrag = true;
  }, []);

  const onPointerUp = useCallback(() => {
    if (drag.current?.didDrag) blockClick.current = true;
    drag.current = null;
  }, []);

  const onPointerLeave = useCallback(() => {
    if (drag.current?.didDrag) blockClick.current = true;
    drag.current = null;
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (blockClick.current) {
      e.preventDefault();
      e.stopPropagation();
      blockClick.current = false;
    }
  }, []);

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onClickCapture,
  };
}

interface CategoryNavProps {
  categories: Category[];
  subCategories: SubCategory[];
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  onCategorySelect: (category: Category) => void;
  onSubCategorySelect: (subCategory: SubCategory) => void;
  className?: string;
}

/** 한 줄 탭 버튼 — 가이드 컬러·폰트 사용, 선택 시 주황 글자+밑줄만 */
function TabButton({
  isSelected,
  onClick,
  children,
  size,
  disabled,
}: {
  isSelected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size: "main" | "sub";
  disabled?: boolean;
}) {
  const isMain = size === "main";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative shrink-0 whitespace-nowrap border-0 bg-transparent transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange-400)] focus-visible:ring-offset-2",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:transition-colors",
        isMain ? "min-h-[48px] px-4 py-3" : "min-h-[44px] px-3 py-2.5",
        isSelected && "primary_orange_400_t after:bg-[var(--primary-orange-400)] text_2lg_bold",
        !isSelected &&
          "gray_gray_400_t after:bg-transparent hover:primary_orange_400_t text_2lg_medium"
      )}
    >
      {children}
    </button>
  );
}

export function CategoryNav({
  categories,
  subCategories,
  selectedCategoryId,
  selectedSubCategoryId,
  onCategorySelect,
  onSubCategorySelect,
  className,
}: CategoryNavProps) {
  const subList = selectedCategoryId
    ? subCategories.filter((s) => s.categoryId === selectedCategoryId)
    : [];
  const subDisabled = !selectedCategoryId;

  const categoryScroll = useDragToScroll();
  const subScroll = useDragToScroll();

  return (
    <div
      className={cn(
        "w-full border-b border-[var(--line-line-200)] ",
        className
      )}
    >
      {/* 상품 카테고리 (대분류) */}
      <nav role="tablist" aria-label="상품 카테고리" className="border-b border-[var(--line-line-200)]">
        <div
          ref={categoryScroll.ref}
          className={scrollClass}
          style={scrollStyle}
          onPointerDown={categoryScroll.onPointerDown}
          onPointerMove={categoryScroll.onPointerMove}
          onPointerUp={categoryScroll.onPointerUp}
          onPointerLeave={categoryScroll.onPointerLeave}
          onPointerCancel={categoryScroll.onPointerUp}
          onClickCapture={categoryScroll.onClickCapture}
        >
          {categories.map((c) => (
            <TabButton
              key={c.id}
              isSelected={selectedCategoryId === c.id}
              onClick={() => onCategorySelect(c)}
              size="main"
            >
              {c.name}
            </TabButton>
          ))}
        </div>
      </nav>

      {/* 상품 하위 카테고리 (소분류) */}
      {subList.length > 0 && (
        <nav
          role="tablist"
          aria-label="상품 하위 카테고리"
          className={cn(
            "border-t border-[var(--line-line-100)] md:border-t-0",
            subDisabled && "pointer-events-none opacity-60"
          )}
        >
          <div
            ref={subScroll.ref}
            className={cn("mt-0", scrollClass)}
            style={scrollStyle}
            onPointerDown={subScroll.onPointerDown}
            onPointerMove={subScroll.onPointerMove}
            onPointerUp={subScroll.onPointerUp}
            onPointerLeave={subScroll.onPointerLeave}
            onPointerCancel={subScroll.onPointerUp}
            onClickCapture={subScroll.onClickCapture}
          >
            {subList.map((s) => (
              <TabButton
                key={s.id}
                isSelected={selectedSubCategoryId === s.id}
                onClick={() => onSubCategorySelect(s)}
                size="sub"
                disabled={subDisabled}
              >
                {s.name}
              </TabButton>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
