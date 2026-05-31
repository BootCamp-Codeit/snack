"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PurchaseRequestItem } from "../_types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PurchaseRequestItem["rawStatus"], string> = {
  OPEN: "승인 대기",
  PARTIALLY_APPROVED: "부분 승인",
  READY_TO_PURCHASE: "승인 완료",
  REJECTED: "구매 반려",
  CANCELED: "요청 취소",
  PURCHASED: "승인 완료",
};

/** thead th 공통: Pretendard 20px medium, line-height 32px, Black-100, center */
const TH_STYLE =
  "text-center font-medium font-[Pretendard] text-[20px] leading-[32px] text-[var(--black-black-100,#6B6B6B)]";

interface PurchaseRequestTableProps {
  items: PurchaseRequestItem[];
  onCancelRequest: (item: PurchaseRequestItem) => void;
  className?: string;
}

export function PurchaseRequestTable({
  items,
  onCancelRequest,
  className,
}: PurchaseRequestTableProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "overflow-x-auto",
        className
      )}
    >
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th
              className={cn(
                TH_STYLE,
                "w-60 pl-[80px] pr-[40px] pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-l border-[var(--gray-gray-200)] first:rounded-l-full"
              )}
            >
              구매요청일
            </th>
            <th
              className={cn(
                TH_STYLE,
                "px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-[var(--gray-gray-200)]"
              )}
            >
              상품정보
            </th>
            <th
              className={cn(
                TH_STYLE,
                "px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-[var(--gray-gray-200)]"
              )}
            >
              주문 금액
            </th>
            <th
              className={cn(
                TH_STYLE,
                "px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-[var(--gray-gray-200)]"
              )}
            >
              상태
            </th>
            <th
              className={cn(
                TH_STYLE,
                "w-24 whitespace-nowrap px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-r border-[var(--gray-gray-200)] last:rounded-r-full pr-[80px]"
              )}
            >
              비고
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const canCancel = item.rawStatus === "OPEN";
            return (
              <tr
                key={item.id}
                className="[&>td]:border-b [&>td]:line_line_200_l last:[&>td]:border-b-0 cursor-pointer"
                onClick={() => router.push(`/purchase-request-detail?id=${item.id}`)}
              >
                <td className="w-28 min-w-0 pl-[80px] pr-[40px] py-6 text-center font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                  {item.requestDate}
                </td>
                <td className="px-4 py-6 text-left">
                  <div className="font-[Pretendard] text-[20px] font-semibold leading-[32px] text-[var(--black-black-200,#525252)]">
                    {item.productSummary}
                  </div>
                  <div className="font-[Pretendard] text-[14px] font-medium leading-[24px] text-[var(--gray-gray-500,#999)]">
                    총 수량: {item.totalQuantity}개
                  </div>
                </td>
                <td className="px-4 py-6 text-center font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                  {item.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-6 text-center">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-center font-[Pretendard] text-[20px] font-normal leading-[32px]",
                      (item.rawStatus === "OPEN" ||
                        item.rawStatus === "PARTIALLY_APPROVED" ||
                        item.rawStatus === "READY_TO_PURCHASE") &&
                        "text-[var(--black-black-100,#6B6B6B)]",
                      (item.rawStatus === "REJECTED" ||
                        item.rawStatus === "CANCELED" ||
                        item.rawStatus === "PURCHASED") &&
                        "text-[var(--gray-gray-300,#C4C4C4)]"
                    )}
                  >
                    {STATUS_LABEL[item.rawStatus]}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-6 pr-[80px] text-center">
                  {canCancel ? (
                    <Button
                      type="button"
                      variant="outlined"
                      size="etc-sm"
                      className="!h-8 !min-w-0 !w-auto !rounded-lg !px-4 !py-2 font-[Pretendard] !text-[18px] !font-semibold !leading-[26px] !text-[var(--primary-orange-400,#F97B22)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        onCancelRequest(item);
                      }}
                    >
                      요청 취소
                    </Button>
                  ) : (
                    <span className="inline-block font-[Pretendard] text-[18px] font-semibold leading-[26px] text-gray-400">
                      -
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
