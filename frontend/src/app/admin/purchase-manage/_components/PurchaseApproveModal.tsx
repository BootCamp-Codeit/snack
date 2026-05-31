"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PurchaseRequestDetailItem } from "../detail/_types";

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export interface PurchaseApproveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requesterName: string;
  items: PurchaseRequestDetailItem[];
  remainingBudget: number;
  isSubmitting?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onApprove: (message: string) => void | Promise<void>;
}

export function PurchaseApproveModal({
  open,
  onOpenChange,
  requesterName,
  items,
  remainingBudget,
  isSubmitting = false,
  errorMessage = "",
  onCancel,
  onApprove,
}: PurchaseApproveModalProps) {
  const [approvalMessage, setApprovalMessage] = useState("");

  useEffect(() => {
    if (open) setApprovalMessage("");
  }, [open]);

  const { totalCount, totalPrice } = useMemo(() => {
    const count = items.reduce((acc, cur) => acc + cur.quantity, 0);
    const price = items.reduce(
      (acc, cur) => acc + cur.quantity * cur.unitPrice,
      0
    );
    return { totalCount: count, totalPrice: price };
  }, [items]);
  const isOverBudget = totalPrice > remainingBudget;
  const normalizedMessage = approvalMessage.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[min(90vh,800px)] w-[calc(100%-2rem)] max-w-[560px] overflow-y-auto rounded-[20px] border border-[#F5E6DC] bg-[#FFFBF7] p-6 shadow-xl sm:p-8"
        )}
      >
        <div className="border-b border-[#E8D9CE] pb-4">
          <DialogTitle className="text-left font-[Pretendard] text-[22px] font-bold leading-[30px] text-[var(--black-black-400,#1F1F1F)]">
            구매 요청 승인
          </DialogTitle>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <p className="font-[Pretendard] text-[16px] font-semibold leading-[24px] text-[var(--black-black-400,#1F1F1F)]">
              요청인
            </p>
            <div className="rounded-[16px] border border-[#FFD7BF] bg-white px-5 py-[14px] font-[Pretendard] text-[16px] leading-[24px] text-[var(--black-black-200,#525252)]">
              {requesterName}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-[Pretendard] text-[16px] font-semibold leading-[24px] text-[var(--black-black-400,#1F1F1F)]">
              요청 품목
            </p>
            <div className="max-h-[260px] overflow-y-auto rounded-[16px] border border-[#E8D9CE] bg-white p-4 sm:p-5">
              {items.map((line) => {
                const rowTotal = line.quantity * line.unitPrice;
                return (
                  <div
                    key={line.id}
                    className="border-b border-[var(--gray-gray-200,#E0E0E0)] py-5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-[10px] border border-[var(--gray-gray-200,#E0E0E0)] bg-[var(--gray-gray-50)] p-2 sm:h-[62px] sm:w-[62px]">
                        <Image
                          src={line.imageUrl}
                          alt={line.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-[Pretendard] text-[13px] font-medium leading-[20px] text-[var(--gray-gray-500,#999)]">
                          {line.category}
                        </p>
                        <p className="font-[Pretendard] text-[15px] font-semibold leading-[22px] text-[var(--black-black-400,#1F1F1F)] sm:text-[16px] sm:leading-[24px]">
                          {line.name}
                        </p>
                        <p className="mt-1 font-[Pretendard] text-[14px] font-medium leading-[22px] text-[var(--black-black-400,#1F1F1F)]">
                          수량: {line.quantity}개
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-[Pretendard] text-[14px] font-semibold leading-[22px] text-[var(--black-black-400,#1F1F1F)] sm:text-[15px]">
                          {formatPrice(line.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <p className="font-[Pretendard] text-[17px] font-bold leading-[26px] text-[var(--black-black-400,#1F1F1F)] sm:text-[18px]">
                        {formatPrice(rowTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-2 border-t border-[#E8D9CE] pt-4">
            <p className="font-[Pretendard] text-[18px] font-semibold leading-[28px] text-[var(--black-black-400,#1F1F1F)] sm:text-[20px]">
              총 {totalCount}건
            </p>
            <p className="font-[Pretendard] text-[22px] font-bold leading-[32px] text-[#FF8225] sm:text-[26px]">
              {formatPrice(totalPrice)}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-[Pretendard] text-[15px] font-medium leading-[24px] text-[var(--black-black-100,#6B6B6B)]">
              남은 예산 금액
            </span>
            <div className="rounded-[16px] border border-[#FFD7BF] bg-white px-5 py-[14px] font-[Pretendard] text-[17px] font-bold leading-[26px] text-[var(--black-black-400,#1F1F1F)] sm:text-[18px]">
              {formatPrice(remainingBudget)}
            </div>
            {isOverBudget && (
              <p className="font-[Pretendard] text-[14px] font-medium leading-[22px] text-[#E53935]">
                구매 금액이 남은 예산을 초과합니다.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-[Pretendard] text-[16px] font-semibold leading-[24px] text-[var(--black-black-400,#1F1F1F)]">
              승인 메시지
            </p>
            <textarea
              value={approvalMessage}
              onChange={(e) => setApprovalMessage(e.target.value)}
              placeholder="승인 메시지를 입력해주세요."
              rows={4}
              disabled={isSubmitting}
              className="w-full resize-none rounded-[16px] border border-[#FFD7BF] bg-white px-5 py-[14px] font-[Pretendard] text-[15px] leading-[24px] text-[var(--black-black-400,#1F1F1F)] placeholder:text-[var(--gray-gray-400,#ABABAB)] outline-none focus-visible:ring-2 focus-visible:ring-[#FF8225]/30"
            />
            {errorMessage ? (
              <p className="font-[Pretendard] text-[14px] font-medium leading-[22px] text-[#E53935]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            type="button"
            variant="outlined"
            disabled={isSubmitting}
            className="!h-14 min-w-0 flex-[2] !rounded-[14px] !border-0 !bg-[#FFF0E6] font-[Pretendard] !text-[17px] !font-semibold !leading-[26px] !text-[#FF8225] hover:!bg-[#FFE8D9]"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
          >
            취소
          </Button>
          <Button
            type="button"
            variant="solid"
            disabled={isSubmitting || isOverBudget}
            className="!h-14 min-w-0 flex-[3] !rounded-[14px] !bg-[#FF8225] font-[Pretendard] !text-[17px] !font-semibold !leading-[26px] !text-white hover:!bg-[#F06E18]"
            onClick={() => {
              if (isSubmitting || isOverBudget) return;
              void onApprove(normalizedMessage);
            }}
          >
            {isSubmitting ? "승인 중..." : "승인하기"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
