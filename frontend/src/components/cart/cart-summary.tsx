"use client";

import { Button } from "@/components/ui/button";
import { type RequestItem } from "@/components/ui/dialog";
import ItemRequestModal from "./item-request-modal";
import { useRouter } from "next/navigation";

interface CartSummaryProps {
  checkedCount: number;
  totalProductPrice: number;
  totalShipping: number;
  totalPrice: number;
  totalCount: number;
  requestItems: RequestItem[];
  requesterName: string;
  onComplete: (message: string) => void;
}

export default function CartSummary({
  checkedCount,
  totalProductPrice,
  totalShipping,
  totalPrice,
  totalCount,
  requestItems,
  requesterName,
  onComplete,
}: CartSummaryProps) {
  const router = useRouter();

  return (
    <div className="w-full lg:w-[386px] lg:flex-shrink-0 flex flex-col">
      {/* 주문 요약 박스 */}
      <div className="flex flex-col lg:h-[324px] px-6 py-8 lg:py-[60px] lg:rounded-[16px] lg:border lg:border-gray-100 lg:bg-white lg:shadow-[4px_4px_20px_0_rgba(250,250,250,0.12)] mb-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <span className="text-base font-[500] text-gray-400">총 주문 상품</span>
            <span className="text-2xl font-bold text-[#E5762C]">{checkedCount}개</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base font-[500] text-gray-400">상품금액</span>
            <span className="text-2xl font-bold text-gray-900">{totalProductPrice.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base font-[500] text-gray-400">배송비</span>
            <span className="text-2xl font-bold text-gray-900">{totalShipping.toLocaleString()}원</span>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between">
          <span className="text-lg font-[600] text-gray-400">총 주문금액</span>
          <span className="text-2xl font-bold text-[#E5762C]">{totalPrice.toLocaleString()}원</span>
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex flex-col gap-3">
        <ItemRequestModal
          requesterName={requesterName}
          items={requestItems}
          totalCount={totalCount}
          totalPrice={totalPrice}
          onComplete={onComplete}
          trigger={
            <Button variant="solid" className="py-4 h-auto w-full rounded-[16px] text-[20px] font-[600] cursor-pointer active:scale-95 transition-transform">
              구매 요청
            </Button>
          }
        />
        <Button
          variant="invite"
          className="py-4 h-auto text-[20px] font-[600] w-full justify-center rounded-[16px] bg-[#FDF0DF] cursor-pointer active:scale-95 transition-transform"
          onClick={() => router.push("/productlist")}
        >
          계속 쇼핑하기
        </Button>
      </div>
    </div>
  );
}