"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import CartItem from "./cart-item";
import { CART_GRID } from "./cart-constants";

interface CartItemData {
  id: string;
  image: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  shipping: number;
  checked: boolean;
}

interface CartItemListProps {
  items: CartItemData[];
  requesterName: string;
  allChecked: boolean;
  onToggleAll: () => void;
  onToggleItem: (id: string) => void;
  onDeleteAll: () => void;
  onDeleteSelected: () => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onDeleteItem: (id: string) => void;
  onComplete?: (message: string) => void;
}

export default function CartItemList({
  items,
  requesterName,
  allChecked,
  onToggleAll,
  onToggleItem,
  onDeleteAll,
  onDeleteSelected,
  onQuantityChange,
  onDeleteItem,
  onComplete,
}: CartItemListProps) {
  return (
    <div className="w-full">
      {/* 모바일 전체선택 */}
      <div className="lg:hidden flex items-center gap-3 px-2 py-3 border-b border-gray-200 mb-2">
        <Checkbox
          variant="checkbox02"
          checkboxSize="sm"
          checked={allChecked}
          onChange={onToggleAll}
        />
        <span className="text-base text-gray-900">전체 선택</span>
      </div>

      <div className="lg:border-y border-gray-300">
        {/* 헤더 */}
        <div className={`hidden lg:grid ${CART_GRID} h-[80px] border-b border-gray-300`}>
          <div className="flex items-center gap-3 px-6">
            <Checkbox
              variant="checkbox02"
              checkboxSize="sm"
              checked={allChecked}
              onChange={onToggleAll}
            />
            <span className="text-[20px] font-[400] text-gray-900">상품정보</span>
          </div>
          <div className="flex items-center justify-center border-l border-gray-300 text-[20px] font-[400] text-gray-900">
            수량
          </div>
          <div className="flex items-center justify-center border-l border-gray-300 text-[20px] font-[400] text-gray-900">
            주문 금액
          </div>
          <div className="flex items-center justify-center border-l border-gray-300 text-[20px] font-[400] text-gray-900">
            배송 정보
          </div>
        </div>

        {/* 아이템 */}
        {items.map((item) => (
          <CartItem
            key={item.id}
            {...item}
            requesterName={requesterName}
            onToggle={onToggleItem}
            onQuantityChange={onQuantityChange}
            onDelete={onDeleteItem}
            onComplete={onComplete}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      {items.length > 0 && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={onDeleteAll}
            className="w-[139px] h-[50px] px-[18px] py-[12px] rounded-full border border-gray-200 bg-transparent text-sm text-gray-500 hover:bg-gray-50 cursor-pointer active:scale-95 transition-transform"
          >
            전체 상품 삭제
          </button>
          <button
            onClick={onDeleteSelected}
            className="w-[139px] h-[50px] px-[18px] py-[12px] rounded-full border border-gray-200 bg-transparent text-sm text-gray-500 hover:bg-gray-50 cursor-pointer active:scale-95 transition-transform"
          >
            선택 상품 삭제
          </button>
        </div>
      )}
    </div>
  );
}