"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ensureAccessTokenFresh,
  refreshAuthTokensOnce,
} from "@/lib/auth/ensure-access-token";
import { buildCartAuthHeaders } from "@/lib/cart/auth-headers";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogField,
  DialogLabel,
  DialogReadonlyField,
  DialogItemList,
  DialogSummary,
  DialogTextarea,
  DialogFooter,
  DialogClose,
  type RequestItem,
} from "@/components/ui/dialog";

interface ItemRequestModalProps {
  requesterName: string;
  items: RequestItem[];
  totalCount: number;
  totalPrice: number;
  trigger: React.ReactNode;
  onComplete?: (message: string) => void;
}

export default function ItemRequestModal({
  requesterName,
  items,
  totalCount,
  totalPrice,
  trigger,
  onComplete,
}: ItemRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (items.length === 0 || isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);

    const okSession = await ensureAccessTokenFresh();
    if (!okSession) {
      setSubmitError("로그인이 만료되었습니다. 다시 로그인해 주세요.");
      setIsSubmitting(false);
      return;
    }

    // POST /api/purchase-requests 본문은 백엔드 DTO에 맞게 `requestMessage`만 전송
    const payload = JSON.stringify({
      requestMessage: message.trim(),
    });

    const doPost = () => {
      const auth = buildCartAuthHeaders();
      if (!auth.Authorization) {
        return Promise.resolve(
          new Response(null, { status: 401, statusText: "Unauthorized" }),
        );
      }
      return fetch("/api/purchase-requests", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...auth,
        },
        body: payload,
      });
    };

    try {
      let res = await doPost();
      if (res.status === 401 && (await refreshAuthTokensOnce())) {
        res = await doPost();
      }
      if (res.status === 429) {
        const retryAfter = Number.parseInt(res.headers.get("retry-after") ?? "1", 10);
        const waitMs = Number.isFinite(retryAfter)
          ? Math.min(Math.max(retryAfter, 1) * 1000, 5000)
          : 1000;
        await new Promise((r) => setTimeout(r, waitMs));
        res = await doPost();
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const msg =
          res.status === 429
            ? "요청이 많아 잠시 후 다시 시도해주세요."
            : (errText || `구매 요청 실패 (${res.status})`);
        throw new Error(msg);
      }
    } catch (e) {
      console.error(e);
      setSubmitError(
        e instanceof Error ? e.message : "구매 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
      );
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
    setOpen(false);
    onComplete?.(message);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSubmitError(null);
          setIsSubmitting(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#FBF8F4]">
        <DialogHeader>
          <DialogTitle>구매 요청</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogField>
            <DialogLabel>요청인</DialogLabel>
            <DialogReadonlyField>{requesterName}</DialogReadonlyField>
          </DialogField>
          <DialogField>
            <DialogLabel>요청 품목</DialogLabel>
            <DialogItemList items={items} maxVisibleItems={2} />
          </DialogField>
          <DialogSummary totalCount={totalCount} totalPrice={totalPrice} />
          <DialogField>
            <DialogLabel>요청 메시지</DialogLabel>
            <DialogTextarea
              placeholder="요청 메시지를 입력해주세요."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </DialogField>
          {submitError ? (
            <p className="text-sm text-red-600" role="alert">
              {submitError}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outlined"
              className="flex-1 h-[50px] rounded-[12px] cursor-pointer active:scale-95 transition-transform"
              disabled={isSubmitting}
            >
              취소
            </Button>
          </DialogClose>
          <Button
            variant="solid"
            className="flex-1 h-[50px] rounded-[12px] cursor-pointer active:scale-95 transition-transform"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "요청 중..." : "구매 요청하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}