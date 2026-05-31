"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PurchaseRequestItem } from "../_types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PurchaseRequestItem["rawStatus"], string> = {
  OPEN: "승인 대기",
  PARTIALLY_APPROVED: "부분 승인",
  READY_TO_PURCHASE: "구매 승인",
  REJECTED: "구매 반려",
  CANCELED: "요청 취소",
  PURCHASED: "승인 완료",
};

function formatDateDisplay(dateStr: string) {
  return dateStr.replace(/\.\s*/g, ". ");
}

interface PurchaseRequestCardProps {
  item: PurchaseRequestItem;
  onCancelRequest: (item: PurchaseRequestItem) => void;
  onApproveRequest: (item: PurchaseRequestItem) => void;
  className?: string;
}

export function PurchaseRequestCard({
  item,
  onCancelRequest,
  onApproveRequest,
  className,
}: PurchaseRequestCardProps) {
  const router = useRouter();
  const canAction =
    item.rawStatus === "OPEN" || item.rawStatus === "PARTIALLY_APPROVED";

  return (
    <div
      className={cn(
        "border-b border-[var(--gray-gray-200)] px-6 py-6 first:border-t last:border-b-0 cursor-pointer",
        className
      )}
      onClick={() => router.push(`/admin/purchase-manage/detail?id=${item.id}`)}
    >
      <div className="mb-6 flex items-start gap-3">
        <div className="relative h-[80px] w-[80px] shrink-0 overflow-hidden rounded-[8px] border border-[var(--gray-gray-200,#E0E0E0)] bg-white p-4">
          {item.imageUrl ? (
            <div className="flex h-full w-full items-center justify-center">
              <Image
                src={item.imageUrl}
                alt=""
                width={32}
                height={32}
                className="h-full w-full object-contain object-center"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-full w-full bg-[var(--gray-gray-100)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[Pretendard] text-[16px] font-semibold leading-[24px] text-[var(--black-black-200,#525252)]">
            {item.productSummary}
          </p>
          <p className="mt-0.5 font-[Pretendard] text-[14px] font-medium leading-[22px] text-[var(--gray-gray-500,#999)]">
            총 수량: {item.totalQuantity}개
          </p>
          {canAction && (
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outlined"
                size="etc-sm"
                className="!h-9 !min-w-0 !flex-1 !rounded-lg !border-[var(--gray-gray-300,#C4C4C4)] !px-3 font-[Pretendard] !text-[14px] !font-semibold !leading-[20px] !text-[var(--gray-gray-400,#ABABAB)]"
                onClick={(event) => {
                  event.stopPropagation();
                  onCancelRequest(item);
                }}
              >
                반려
              </Button>
              <Button
                type="button"
                variant="solid"
                size="etc-sm"
                className="!h-9 !min-w-0 !flex-1 !rounded-lg !px-3 font-[Pretendard] !text-[14px] !font-semibold !leading-[20px]"
                onClick={(event) => {
                  event.stopPropagation();
                  onApproveRequest(item);
                }}
              >
                승인
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-[Pretendard] text-[14px] font-medium leading-[22px] text-[var(--black-black-100,#6B6B6B)]">
          주문금액
        </span>
        <span className="font-[Pretendard] text-[16px] font-bold leading-[24px] text-[var(--black-black-400,#1F1F1F)]">
          {item.totalAmount.toLocaleString()}원
        </span>
      </div>

      <div className="my-4 border-t border-[var(--gray-gray-200)]" />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-[Pretendard] text-[14px] font-medium leading-[22px] text-[var(--black-black-100,#6B6B6B)]">
            구매요청일
          </span>
          <span className="font-[Pretendard] text-[14px] font-normal leading-[22px] text-[var(--gray-gray-500,#999)]">
            {formatDateDisplay(item.requestDate)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-[Pretendard] text-[14px] font-medium leading-[22px] text-[var(--black-black-100,#6B6B6B)]">
            상태
          </span>
          <span
            className={cn(
              "font-[Pretendard] text-[14px] font-normal leading-[22px]",
              (item.rawStatus === "OPEN" ||
                item.rawStatus === "PARTIALLY_APPROVED" ||
                item.rawStatus === "READY_TO_PURCHASE") &&
                "text-[var(--black-black-100,#6B6B6B)]",
              (item.rawStatus === "REJECTED" ||
                item.rawStatus === "CANCELED" ||
                item.rawStatus === "PURCHASED") &&
                "text-[var(--gray-gray-400,#ABABAB)]"
            )}
          >
            {STATUS_LABEL[item.rawStatus]}
          </span>
        </div>
      </div>
    </div>
  );
}
