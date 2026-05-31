"use client";

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
  productSummary: string; // "코카콜라 외 1건"
  onConfirm: () => void;
}

export function ConfirmCancelModal({
  open,
  onOpenChange,
  productSummary,
  onConfirm,
}: ConfirmCancelModalProps) {
  const handleConfirm = () => {
    onConfirm();
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
            구매 요청 취소
          </DialogTitle>
          <div className="mt-2 space-y-1 text-center font-[Pretendard] text-[20px] font-medium leading-[32px]" id="cancel-modal-desc">
            <p>
              <span className="text-[var(--black-black-100,#6B6B6B)]">{productSummary}</span>
              <span className="text-[var(--gray-gray-400,#ABABAB)]"> 구매 요청을 취소하시겠어요?</span>
            </p>
            <p className="text-[var(--gray-gray-400,#ABABAB)]">
              구매 요청 취소 후에는 복구할 수 없어요!
            </p>
          </div>
          <DialogDescription className="sr-only">
            {productSummary} 구매 요청을 취소하시겠어요? 구매 요청 취소 후에는 복구할 수 없어요.
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
            className="order-2 flex !h-16 !w-[280px] shrink-0 items-center justify-center !rounded-lg !p-4 text-center font-[Pretendard] !text-[20px] !font-semibold !leading-[32px] !text-[var(--gray-gray-50,#FFF)]"
            onClick={handleConfirm}
          >
            취소할래요
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
