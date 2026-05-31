"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { CONTENT_PADDING_X } from "@/components/header";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import { Button } from "@/components/ui/button";
import { useAuthHeader } from "@/hooks/use-auth-header";
import { useDevice } from "@/hooks/use-device";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { addCartItem } from "../productlist/_lib/api";
import { getPurchaseRequestDetail, type PurchaseRequestDetailResult } from "../purchase-requests/_lib/api";

const DEFAULT_IMAGE = "/assets/purchase_request_details/cola.png";

const STATUS_LABEL: Record<PurchaseRequestDetailResult["status"], string> = {
  OPEN: "승인 대기",
  PARTIALLY_APPROVED: "부분 승인",
  READY_TO_PURCHASE: "승인 완료",
  REJECTED: "구매 반려",
  CANCELED: "요청 취소",
  PURCHASED: "구매 완료",
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}. ${mm}. ${dd}.`;
}

function pickFirstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text_xl_semibold black_black_400_t">
        {label}
      </p>
      <div className="self-stretch rounded-[16px] border border-[var(--gray-gray-200,#E0E0E0)] background_background_400_b flex items-start px-6 py-[14px] text_xl_regular gray_gray_500_t">
        {value}
      </div>
    </div>
  );
}

function PurchaseRequestDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const device = useDevice();
  const { isLoggedIn, role } = useAuthHeader();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [requestOpen, setRequestOpen] = useState(true);
  const [approvalOpen, setApprovalOpen] = useState(true);
  const [detail, setDetail] = useState<PurchaseRequestDetailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRestoringCart, setIsRestoringCart] = useState(false);

  const requestId = Number(searchParams.get("id"));

  useEffect(() => {
    if (!Number.isFinite(requestId) || requestId <= 0) {
      setErrorMessage("잘못된 접근입니다. 요청 ID를 확인해주세요.");
      setDetail(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    getPurchaseRequestDetail(requestId)
      .then((data) => setDetail(data))
      .catch((error) =>
        setErrorMessage(
          error instanceof Error ? error.message : "상세 정보를 불러오지 못했습니다."
        )
      )
      .finally(() => setLoading(false));
  }, [requestId]);

  const useAccordion = !isDesktop;
  const totalCount = useMemo(
    () => detail?.items.reduce((acc, cur) => acc + cur.quantity, 0) ?? 0,
    [detail]
  );
  const totalPrice = useMemo(
    () =>
      detail?.items.reduce(
        (acc, cur) => acc + Number(cur.lineTotal || 0),
        0
      ) ?? 0,
    [detail]
  );

  const approvalInfo = useMemo(() => {
    if (!detail) {
      return {
        approvalDate: "-",
        manager: "-",
        resultMessage: "-",
      };
    }

    const raw = detail as unknown as Record<string, unknown>;
    const approvalDateRaw = pickFirstString(raw, [
      "approvedAt",
      "approvalDate",
      "decisionAt",
      "decidedAt",
      "decision_at",
      "updatedAt",
    ]);
    const manager = pickFirstString(raw, [
      "approverName",
      "approver_name",
      "managerName",
      "approvedByName",
      "approved_by_name",
      "decisionByName",
      "decision_by_name",
      "manager",
    ]);
    const resultMessage = pickFirstString(raw, [
      "decisionMessage",
      "decision_message",
      "approvalMessage",
      "approval_message",
      "rejectReason",
      "reject_reason",
      "rejectionReason",
      "rejection_reason",
      "message",
    ]);

    return {
      approvalDate: formatDate(approvalDateRaw ?? detail.updatedAt ?? null),
      manager: manager ?? "-",
      resultMessage:
        resultMessage ?? (detail.status === "REJECTED" ? "반려된 요청입니다." : "-"),
    };
  }, [detail]);

  const handleRestoreCart = async () => {
    if (!detail || isRestoringCart) return;

    const restorableItems = detail.items.filter((item) => item.productId != null);
    if (restorableItems.length === 0) {
      setErrorMessage("장바구니에 다시 담을 수 있는 상품이 없습니다.");
      return;
    }

    setIsRestoringCart(true);
    setErrorMessage("");
    try {
      await Promise.all(
        restorableItems.map((item) =>
          addCartItem(Number(item.productId), item.quantity)
        )
      );
      router.push("/cart");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "장바구니 담기에 실패했습니다."
      );
    } finally {
      setIsRestoringCart(false);
    }
  };

  return (
    <div className="min-h-screen background_background_400_b">
      <HeaderWithCart device={device} isLoggedIn={isLoggedIn} role={role} />

      <main className={cn(CONTENT_PADDING_X, "pb-12 pt-3.5 md:pt-10")}>
        <div className="mx-auto w-full max-w-[1680px]">
          <h1 className="mb-6 text_3xl_semibold black_black_400_t xl:mb-10">
            구매 요청 내역
          </h1>

          {errorMessage ? (
            <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
              {errorMessage}
            </div>
          ) : loading || !detail ? (
            <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
              상세 정보를 불러오는 중입니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[50px] lg:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="order-2 space-y-4 lg:order-1">
              <h2 className="text_2xl_bold black_black_400_t">
                요청 품목
              </h2>

              <div className="rounded-[20px] border border-[var(--black-black-100,#6B6B6B)] bg-white p-6 xl:p-10">
                <div className="-mr-6 h-[360px] overflow-y-auto pr-6 lg:h-[460px] xl:-mr-10 xl:h-[560px] xl:pr-10">
                  {detail.items.map((item) => {
                    const rowTotal = Number(item.lineTotal);
                    return (
                      <div
                        key={item.id}
                        className="border-b border-[var(--gray-gray-200,#E0E0E0)] py-6 first:pt-0 last:pb-0 last:border-b-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden rounded-[10px] border border-[var(--gray-gray-200,#E0E0E0)] background_background_400_b p-3 xl:h-[82px] xl:w-[82px]">
                            <Image
                              src={DEFAULT_IMAGE}
                              alt={item.productNameSnapshot}
                              fill
                              className="object-contain p-2"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            <p className="text_md_regular gray_gray_500_t">
                              판매처 #{item.sellerOrganizationId}
                            </p>
                            <p className="text_2lg_medium black_black_400_t">
                              {item.productNameSnapshot}
                            </p>
                          </div>
                          <p className="shrink-0 whitespace-nowrap text_2lg_semibold black_black_400_t">
                            {formatPrice(Number(item.unitPriceSnapshot))}
                          </p>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                          <p className="text_lg_medium black_black_400_t">
                            수량: {item.quantity}개
                          </p>
                          <p className="whitespace-nowrap text_2xl_bold black_black_400_t">
                            {formatPrice(rowTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 sm:gap-3">
                <p className="text_2xl_semibold black_black_400_t">
                  총 {totalCount}건
                </p>
                <p className="whitespace-nowrap text_3xl_bold primary_orange_400_t">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outlined"
                  className="!h-14 !min-w-0 !flex-1 !rounded-[16px] !border-0 !bg-[#FFF6E9] text-center text_xl_semibold primary_orange_400_t cursor-pointer xl:!h-[72px]"
                  onClick={() => router.push("/purchase-requests")}
                >
                  목록 보기
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  className="!h-14 !min-w-0 !flex-1 !rounded-[16px] text-center text_xl_semibold gray_gray_50_t cursor-pointer xl:!h-[72px]"
                  onClick={handleRestoreCart}
                  disabled={isRestoringCart}
                >
                  {isRestoringCart ? "담는 중..." : "장바구니 다시 담기"}
                </Button>
              </div>
            </section>

            <section className="order-1 space-y-6 lg:order-2 xl:space-y-8">
              <div>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between border-b border-[var(--black-black-100,#6B6B6B)] pb-3 text-left",
                    !useAccordion && "cursor-default"
                  )}
                  onClick={() => useAccordion && setRequestOpen((prev) => !prev)}
                >
                  <h2 className="text_2xl_bold black_black_400_t">
                    요청 정보
                  </h2>
                  {useAccordion && (
                    <ChevronUp
                      className={cn(
                        "h-5 w-5 text-[var(--gray-gray-400,#ABABAB)] transition-transform",
                        !requestOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>
                {(requestOpen || !useAccordion) && (
                  <div className="space-y-6 pt-4">
                    <p className="text_xl_regular gray_gray_400_t">
                      {formatDate(detail.requestedAt)}
                    </p>
                    <InfoField label="요청인" value={`사용자 #${detail.requesterUserId}`} />
                    <InfoField label="요청 메시지" value={detail.requestMessage ?? "-"} />
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between border-b border-[var(--black-black-100,#6B6B6B)] pb-3 text-left",
                    !useAccordion && "cursor-default"
                  )}
                  onClick={() => useAccordion && setApprovalOpen((prev) => !prev)}
                >
                  <h2 className="text_2xl_bold black_black_400_t">
                    승인 정보
                  </h2>
                  {useAccordion && (
                    <ChevronUp
                      className={cn(
                        "h-5 w-5 text-[var(--gray-gray-400,#ABABAB)] transition-transform",
                        !approvalOpen && "rotate-180"
                      )}
                    />
                  )}
                </button>
                {(approvalOpen || !useAccordion) && (
                  <div className="space-y-6 pt-4">
                    <p className="text_xl_regular gray_gray_400_t">
                      {approvalInfo.approvalDate}
                    </p>
                    <InfoField label="담당자" value={approvalInfo.manager} />
                    <InfoField label="상태" value={STATUS_LABEL[detail.status]} />
                    <InfoField
                      label="결과 메시지"
                      value={approvalInfo.resultMessage}
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PurchaseRequestDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen background_background_400_b">
          <main className={cn(CONTENT_PADDING_X, "pb-12 pt-3.5 md:pt-10")}>
            <div className="mx-auto w-full max-w-[1680px]">
              <h1 className="mb-6 text_3xl_semibold black_black_400_t xl:mb-10">
                구매 요청 내역
              </h1>
              <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
                상세 정보를 불러오는 중입니다.
              </div>
            </div>
          </main>
        </div>
      }
    >
      <PurchaseRequestDetailContent />
    </Suspense>
  );
}
