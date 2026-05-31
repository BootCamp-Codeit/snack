"use client";

import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CART_GRID } from "./cart-constants";
import ItemRequestModal from "./item-request-modal";
import type { RequestItem } from "@/components/ui/dialog";
import Image from "next/image";

interface CartItemProps {
  id: string;
  image: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
  shipping: number;
  checked: boolean;
  requesterName: string;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onQuantityChange?: (id: string, quantity: number) => void;
  onComplete?: (message: string) => void;
}

export default function CartItem({
  id,
  image,
  category,
  name,
  price,
  quantity,
  shipping,
  checked,
  requesterName,
  onToggle,
  onDelete,
  onQuantityChange,
  onComplete,
}: CartItemProps) {
  const requestItem: RequestItem[] = [{
    id,
    image,
    category,
    name,
    price,
    quantity,
  }];

  return (
    <>
      {/* PC 레이아웃 */}
      <div className={`hidden lg:grid ${CART_GRID} h-[208px] border-b border-gray-300 last:border-b-0`}>
        {/* 상품 정보 */}
        <div className="flex items-center gap-6 px-6 py-6">
          <Checkbox variant="checkbox02" checkboxSize="sm" checked={checked} onChange={() => onToggle(id)} />
          <div className="relative w-[160px] h-[160px] flex-shrink-0 rounded-[8px] border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 160px"
              />
            ) : (
              <p className="text-xs text-gray-400 text-center px-2">{name}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
            <p className="text-[20px] font-[400] text-gray-900 truncate">{name}</p>
            <p className="text-[24px] font-[700] text-gray-900">{price.toLocaleString()}원</p>
          </div>
          <button onClick={() => onDelete?.(id)} className="flex-shrink-0 self-start w-[36px] h-[36px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
            <X size={36} className="text-gray-400 hover:text-gray-700" />
          </button>
        </div>

        {/* 수량 */}
        <div className="flex items-center justify-center border-l border-gray-300">
          <div className="flex items-center h-[54px] w-[160px] rounded-[16px] border border-orange-300 bg-gray-50 px-[14px]">
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => onQuantityChange?.(id, Math.max(1, Number(e.target.value) || 1))}
              className="flex-1 text-right text-[18px] font-[400] text-[#E5762C] bg-transparent outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[#E5762C] text-[18px] font-[400] pr-1">개</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => onQuantityChange?.(id, quantity + 1)} className="flex items-center justify-center text-[#E5762C] hover:text-[#d06820] cursor-pointer active:scale-90 transition-transform">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0L5 0Z"/></svg>
              </button>
              <button onClick={() => onQuantityChange?.(id, Math.max(1, quantity - 1))} className="flex items-center justify-center text-[#E5762C] hover:text-[#d06820] cursor-pointer active:scale-90 transition-transform">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0H10L5 6Z"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* 주문 금액 */}
        <div className="flex flex-col items-center justify-center gap-5 border-l border-gray-300">
          <p className="text-[24px] font-[700] text-gray-900">{(price * quantity).toLocaleString()}원</p>
          <ItemRequestModal
            requesterName={requesterName}
            items={requestItem}
            totalCount={quantity}
            totalPrice={price * quantity}
            onComplete={onComplete}
            trigger={
              <Button variant="solid" className="text-[18px] font-[600] px-8 py-3 rounded-full h-auto w-auto cursor-pointer active:scale-95 transition-transform">
                즉시 요청
              </Button>
            }
          />
        </div>

        {/* 배송 정보 */}
        <div className="flex flex-col items-center justify-center gap-2 border-l border-gray-300">
          <p className="text-[20px] font-[700] text-gray-900">{shipping.toLocaleString()}원</p>
          <p className="text-[20px] font-[400] text-gray-400">택배 배송</p>
        </div>
      </div>

      {/* 태블릿/모바일 카드 레이아웃 */}
      <div className="lg:hidden border border-gray-200 rounded-[16px] bg-white m-2 p-4 last:mb-0">
        {/* 체크박스 + X버튼 */}
        <div className="flex justify-between items-center mb-3">
          <Checkbox variant="checkbox02" checkboxSize="sm" checked={checked} onChange={() => onToggle(id)} />
          <button onClick={() => onDelete?.(id)} className="w-[36px] h-[36px] flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
            <X size={24} className="text-gray-400 hover:text-gray-700" />
          </button>
        </div>

        {/* 이미지 + 상품명/가격 */}
        <div className="flex gap-4 mb-4">
          <div className="relative w-[80px] h-[80px] flex-shrink-0 rounded-[8px] border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <p className="text-xs text-gray-400 text-center px-2">{name}</p>
            )}
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <p className="text-base font-[400] text-gray-900">{name}</p>
            <p className="text-lg font-[700] text-gray-900">{price.toLocaleString()}원</p>
          </div>
        </div>

        {/* 수량 + 즉시요청 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center h-[38px] flex-1 rounded-[16px] border border-orange-300 bg-gray-50 px-3">
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => onQuantityChange?.(id, Math.max(1, Number(e.target.value) || 1))}
              className="flex-1 text-right text-base font-[400] text-[#E5762C] bg-transparent outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[#E5762C] text-base font-[400] pr-1">개</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => onQuantityChange?.(id, quantity + 1)} className="flex items-center justify-center text-[#E5762C] cursor-pointer active:scale-90 transition-transform">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 0L10 6H0L5 0Z"/></svg>
              </button>
              <button onClick={() => onQuantityChange?.(id, Math.max(1, quantity - 1))} className="flex items-center justify-center text-[#E5762C] cursor-pointer active:scale-90 transition-transform">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor"><path d="M5 6L0 0H10L5 6Z"/></svg>
              </button>
            </div>
          </div>
          <ItemRequestModal
            requesterName={requesterName}
            items={requestItem}
            totalCount={quantity}
            totalPrice={price * quantity}
            onComplete={onComplete}
            trigger={
              <Button variant="solid" className="flex-1 h-[38px] text-base font-[600] rounded-[8px] px-8 cursor-pointer active:scale-95 transition-transform">
                즉시 요청
              </Button>
            }
          />
        </div>

        {/* 주문금액 / 배송정보 */}
        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>주문금액</span>
            <span className="font-[700] text-gray-900">{(price * quantity).toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span className="font-[700] text-gray-900">{shipping.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송수단</span>
            <span className="text-gray-400">택배 배송</span>
          </div>
        </div>
      </div>
    </>
  );
}