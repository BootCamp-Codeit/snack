"use client";

import { useRouter } from "next/navigation";
import type { PurchaseRequestItem } from "../_types";
import { cn } from "@/lib/utils";

const TH_STYLE =
  "text-center font-medium font-[Pretendard] text-[20px] leading-[32px] text-[var(--black-black-100,#6B6B6B)]";

interface PurchaseRequestTableProps {
  items: PurchaseRequestItem[];
  className?: string;
}

export function PurchaseRequestTable({
  items,
  className,
}: PurchaseRequestTableProps) {
  const router = useRouter();

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th
              className={cn(
                TH_STYLE,
                "w-44 pl-[80px] pr-[40px] pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-l border-[var(--gray-gray-200)] first:rounded-l-full"
              )}
            >
              구매승인일
            </th>
            <th
              className={cn(
                TH_STYLE,
                "pl-8 pr-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-[var(--gray-gray-200)]"
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
              요청인
            </th>
            <th
              className={cn(
                TH_STYLE,
                "px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-[var(--gray-gray-200)]"
              )}
            >
              담당자
            </th>
            <th
              className={cn(
                TH_STYLE,
                "w-44 whitespace-nowrap px-4 pt-6 pb-6 bg-[var(--gray-gray-50)] border-y border-r border-[var(--gray-gray-200)] last:rounded-r-full pr-[80px]"
              )}
            >
              구매요청일
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            return (
              <tr
                key={item.id}
                className="[&>td]:border-b [&>td]:line_line_200_l last:[&>td]:border-b-0 cursor-pointer"
                onClick={() =>
                  router.push(
                    `/admin/purchase-history/detail?id=${item.purchaseRequestId ?? item.id}`
                  )
                }
              >
                <td className="min-w-0 whitespace-nowrap pl-[80px] pr-[40px] py-6 text-center font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                  {item.approvalDate}
                </td>
                <td className="pl-8 pr-4 py-6 text-left">
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
                  <div className="inline-flex items-center gap-3">
                    <span className="font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                      {item.requester}
                    </span>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-[10px] rounded-[8px] border border-[var(--primary-orange-200,#FDE1CD)] bg-[var(--primary-orange-100,#FEF3EB)] px-[10px] py-[6px] text-center font-[Pretendard] text-[16px] font-semibold leading-[26px] text-[var(--primary-orange-400,#F97B22)]"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      즉시 구매
                    </button>
                  </div>
                </td>
                <td className="px-4 py-6 text-center font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                  {item.manager}
                </td>
                <td className="whitespace-nowrap px-4 py-6 pr-[80px] text-center font-[Pretendard] text-[20px] font-normal leading-[32px] text-[var(--black-black-100,#6B6B6B)]">
                  {item.requestDate}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
