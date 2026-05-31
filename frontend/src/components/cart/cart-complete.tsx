"use client";

import { useRouter } from "next/navigation";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import { Button } from "@/components/ui/button";
import type { RequestItem } from "@/components/ui/dialog";
import Image from "next/image";
import { useAuthHeader } from "@/hooks/use-auth-header";
import { useDevice } from "@/hooks/use-device";

interface CartCompleteProps {
  items: RequestItem[];
  totalCount: number;
  totalPrice: number;
  message: string;
  onBack: () => void;
}

export default function CartComplete({
  items,
  totalCount,
  totalPrice,
  message,
  onBack,
}: CartCompleteProps) {
  const router = useRouter();
  const device = useDevice();
  const { isLoggedIn, role } = useAuthHeader();
  const productSummary =
    items.length === 1
      ? items[0].name
      : `${items[0].name} 외 ${items.length - 1}개`;

  return (
    <div className="min-h-screen bg-[#FBF8F4]">
      <HeaderWithCart device={device} isLoggedIn={isLoggedIn} role={role} />

      {/* 상단 완료 텍스트 */}
      <div className="flex flex-col items-center justify-center gap-2 py-10 px-6 md:px-[120px]">
        <h1 className="text-[32px] font-[600] text-gray-900">구매 요청 완료</h1>
        <p className="text-base text-gray-400">관리자에게 성공적으로 구매 요청이 완료되었습니다.</p>
      </div>

      {/* 콘텐츠 박스 */}
      <div className="mx-auto w-full max-w-[640px] px-6">
        <div className="flex flex-col gap-8 p-8 border-b-2 border-gray-200 bg-[#FBF8F4] shadow-[4px_4px_20px_0_rgba(250,250,250,0.12)]">

          {/* 상품정보 */}
          <span className="text-[24px] font-bold text-gray-900">상품정보</span>
          <div className="border-b-2 border-gray-200" />

          {/* 상품 행 */}
          <div className="flex items-center gap-4">
            <div className="relative w-[120px] h-[120px] rounded-[8px] border border-gray-200 bg-gray-100 flex-shrink-0 overflow-hidden">
              {items[0]?.image ? (
                <Image src={items[0].image} alt={items[0].name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-[500] text-gray-900">{productSummary}</p>
              {items[0]?.category && (
                <p className="text-[14px] text-gray-400">{items[0].category}</p>
              )}
            </div>
          </div>

          {/* 총 수량 / 금액 */}
          <div className="flex justify-between items-center">
            <span className="text-[24px] font-[700] text-gray-900">총 {totalCount}개</span>
            <span className="text-[32px] font-[700] text-[#E5762C]">{totalPrice.toLocaleString()}원</span>
          </div>

          {/* 요청 메시지 */}
          <div className="flex flex-col gap-2">
            <span className="text-[20px] font-[600] text-gray-900">요청 메시지</span>
            <div className="h-[160px] rounded-[16px] border border-gray-200 px-6 py-[14px] text-sm text-gray-500">
              {message || <span className="text-gray-300">요청 메시지가 없습니다.</span>}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-10">
          <Button
            variant="invite"
            className="w-full md:w-[310px] h-[64px] rounded-[16px] text-[20px] font-[600] text-[#E5762C] bg-[#FDF0DF] cursor-pointer active:scale-95 transition-transform"
            onClick={onBack}
          >
            장바구니로 돌아가기
          </Button>
          <Button
            variant="solid"
            className="w-full md:w-[310px] h-[64px] rounded-[16px] text-[20px] font-[600] cursor-pointer active:scale-95 transition-transform"
            onClick={() => router.push("/purchase-requests")}
          >
            요청 내역 확인하기
          </Button>
        </div>
      </div>
    </div>
  );
}