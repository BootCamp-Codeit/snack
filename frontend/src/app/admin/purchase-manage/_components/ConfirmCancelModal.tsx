"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmCancelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productSummary: string;
  onConfirm: (reason: string) => void;
}

export function ConfirmCancelModal({
  open,
  onOpenChange,
  productSummary,
  onConfirm,
}: ConfirmCancelModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const normalizedReason = rejectReason.trim();

  useEffect(() => {
    if (open) setRejectReason("");
  }, [open]);

  const handleConfirm = () => {
    if (!normalizedReason) return;
    onConfirm(normalizedReason);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-8 sm:max-w-[640px]">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex justify-center">
            <div className="relative h-[120px] w-[140px]">
              <Image
                src="/assets/purchase_request_details/dog_ic.svg"
                alt=""
                fill
                className="object-contain"
                unoptimized
              />
              <div className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-[#E5762C]">
                <Image
                  src="/assets/purchase_request_details/exclamation.svg"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                />
              </div>
            </div>
          </div>
          <DialogTitle className="mb-6 font-[Pretendard] text-[24px] font-bold leading-[32px] text-[var(--black-black-400,#1F1F1F)]">
            구매 요청 반려
          </DialogTitle>
          <div
            className="mt-2 space-y-1 text-center font-[Pretendard] text-[20px] font-medium leading-[32px]"
            id="cancel-modal-desc"
          >
            <p>
              <span className="text-[var(--black-black-100,#6B6B6B)]">{productSummary}</span>
              <span className="text-[var(--gray-gray-400,#ABABAB)]"> 구매 요청을 반려하시겠어요?</span>
            </p>
          </div>
          <div className="mt-6 w-full space-y-2">
            <p className="text-left font-[Pretendard] text-[16px] font-semibold leading-[24px] text-[var(--black-black-400,#1F1F1F)]">
              구매 요청 반려 이유
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="구매 요청 반려 이유를 입력해주세요."
              rows={4}
              className="w-full resize-none rounded-[16px] border border-[#FFD7BF] bg-white px-5 py-[14px] font-[Pretendard] text-[15px] leading-[24px] text-[var(--black-black-400,#1F1F1F)] placeholder:text-[var(--gray-gray-400,#ABABAB)] outline-none focus-visible:ring-2 focus-visible:ring-[#FF8225]/30"
            />
          </div>
          <DialogDescription className="sr-only">
            {productSummary} 구매 요청 반려 이유를 입력한 뒤 반려할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outlined"
            className="order-1 flex !h-16 !w-[280px] shrink-0 items-center justify-center !rounded-lg !border-0 !border-2 !border-transparent !p-4 text-center font-[Pretendard] !text-[20px] !font-semibold !leading-[32px] !text-[var(--primary-orange-400,#F97B22)] !bg-orange-50 hover:!border-[var(--primary-orange-400,#F97B22)] hover:!bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            더 생각해볼게요
          </Button>
          <Button
            type="button"
            variant="solid"
            disabled={!normalizedReason}
            className="order-2 flex !h-16 !w-[280px] shrink-0 items-center justify-center !rounded-lg !p-4 text-center font-[Pretendard] !text-[20px] !font-semibold !leading-[32px] !text-[var(--gray-gray-50,#FFF)]"
            onClick={handleConfirm}
          >
            반려할래요
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
