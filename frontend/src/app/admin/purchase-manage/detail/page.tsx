"use client";

import { Suspense, useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { CONTENT_PADDING_X } from "@/components/header";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import { Button } from "@/components/ui/button";
import { useDevice } from "@/hooks/use-device";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import {
  getPurchaseRequestDetail,
  type PurchaseRequestDetailResult,
} from "@/app/purchase-requests/_lib/api";
import { getBudgetSummary } from "../_lib/budget-api";
import {
  approveSellerPurchaseOrder,
  completeSellerPurchaseOrder,
  createExpenseFromSellerOrder,
  getSellerPurchaseOrders,
  rejectSellerPurchaseOrder,
  type SellerOrderListItem,
} from "../_lib/seller-order-api";
import { PurchaseApproveModal } from "../_components/PurchaseApproveModal";
import { ConfirmCancelModal } from "../_components/ConfirmCancelModal";
import type { PurchaseRequestDetailItem } from "./_types";

const DEFAULT_IMAGE = "/assets/purchase_request_details/cola.png";

const STATUS_LABEL: Record<PurchaseRequestDetailResult["status"], string> = {
  OPEN: "승인 대기",
  PARTIALLY_APPROVED: "부분 승인",
  READY_TO_PURCHASE: "구매 승인",
  REJECTED: "구매 반려",
  CANCELED: "요청 취소",
  PURCHASED: "구매 완료",
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}원`;
}

function parseAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function resolveRequesterName(detail: PurchaseRequestDetailResult): string {
  const direct =
    detail.requesterName ??
    detail.requesterDisplayName ??
    detail.requesterUserName ??
    detail.requester?.displayName ??
    detail.requester?.name ??
    detail.requesterUser?.displayName ??
    detail.requesterUser?.name;
  const name = typeof direct === "string" ? direct.trim() : "";
  if (name) return name;
  return `사용자 #${detail.requesterUserId}`;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text_xl_semibold black_black_400_t">{label}</p>
      <div className="self-stretch rounded-[16px] border border-[var(--gray-gray-200,#E0E0E0)] background_background_400_b flex items-start px-6 py-[14px] text_xl_regular gray_gray_500_t">
        {value}
      </div>
    </div>
  );
}

async function findSellerOrderByRequestId(
  purchaseRequestId: number,
  status?: SellerOrderListItem["status"]
): Promise<SellerOrderListItem | null> {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await getSellerPurchaseOrders({
      page,
      limit: 100,
      ...(status ? { status } : {}),
    });
    totalPages = response.totalPages;
    const matched = response.data.find((order) => order.purchaseRequestId === purchaseRequestId);
    if (matched) return matched;
    page += 1;
  }

  return null;
}

function PurchaseManageDetailContent() {
  const searchParams = useSearchParams();
  const device = useDevice();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [requestOpen, setRequestOpen] = useState(true);
  const [approvalOpen, setApprovalOpen] = useState(true);
  const [detail, setDetail] = useState<PurchaseRequestDetailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [approveErrorMessage, setApproveErrorMessage] = useState("");
  const [monthlySpent, setMonthlySpent] = useState<number | null>(null);
  const [monthlyRemaining, setMonthlyRemaining] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const requestId = Number(searchParams.get("id"));

  const fetchCurrentMonthBudgetSummary = useCallback(async () => {
    const now = new Date();
    const budgetData = await getBudgetSummary({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    setMonthlySpent(parseAmount(budgetData.spentAmount));
    setMonthlyRemaining(parseAmount(budgetData.remainingAmount));
  }, []);

  useEffect(() => {
    if (!Number.isFinite(requestId) || requestId <= 0) {
      setErrorMessage("잘못된 접근입니다. 요청 ID를 확인해주세요.");
      setDetail(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    Promise.all([
      getPurchaseRequestDetail(requestId),
      fetchCurrentMonthBudgetSummary(),
    ])
      .then(([detailData]) => {
        setDetail(detailData);
      })
      .catch((error) =>
        setErrorMessage(
          error instanceof Error ? error.message : "상세 정보를 불러오지 못했습니다."
        )
      )
      .finally(() => setLoading(false));
  }, [fetchCurrentMonthBudgetSummary, requestId]);

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
  const canDecision =
    detail?.status === "OPEN" || detail?.status === "PARTIALLY_APPROVED";
  const isBudgetExceeded =
    monthlyRemaining != null && totalPrice > monthlyRemaining;
  const purchaseAfterBudget =
    detail != null && monthlyRemaining != null
      ? Math.max(0, monthlyRemaining - parseAmount(detail.totalAmount))
      : null;
  const handleApprove = useCallback(async () => {
    if (!detail || !canDecision || actionLoading || isBudgetExceeded) return;
    setApproveErrorMessage("");
    setApproveModalOpen(true);
  }, [actionLoading, canDecision, detail, isBudgetExceeded]);

  const handleApproveWithReason = useCallback(
    async (reason: string) => {
      if (!detail || !canDecision || actionLoading || isBudgetExceeded) return;
      try {
        setActionLoading(true);
        const approvedOrder = await findSellerOrderByRequestId(detail.id, "APPROVED");
        const pendingOrder = approvedOrder
          ? null
          : await findSellerOrderByRequestId(detail.id, "PENDING_SELLER_APPROVAL");
        if (!approvedOrder && !pendingOrder) {
          throw new Error("판매자 조직 권한이 없거나 연결 주문이 없습니다.");
        }
        if (pendingOrder) {
          await approveSellerPurchaseOrder({
            orderId: pendingOrder.id,
            decisionMessage: reason,
          });
        }
        const recordTargetOrder =
          (await findSellerOrderByRequestId(detail.id, "APPROVED")) ?? approvedOrder ?? null;
        if (!recordTargetOrder) {
          throw new Error("주문 승인 상태 확인 후 다시 시도해주세요.");
        }
        await completeSellerPurchaseOrder({
          orderId: recordTargetOrder.id,
        });
        await createExpenseFromSellerOrder({
          orderId: recordTargetOrder.id,
          itemsAmount: totalPrice,
          note: "관리자 구매 승인 처리",
        });
        await fetchCurrentMonthBudgetSummary();
        setDetail((prev) =>
          prev == null ? prev : { ...prev, status: "PURCHASED" }
        );
        setApproveModalOpen(false);
        setApproveErrorMessage("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "요청 승인 처리에 실패했습니다.";
        setApproveErrorMessage(message);
        setErrorMessage(message);
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, canDecision, detail, fetchCurrentMonthBudgetSummary, isBudgetExceeded]
  );

  const handleRejectWithReason = useCallback(
    async (reason: string) => {
      if (!detail || !canDecision || actionLoading) return;
      try {
        setActionLoading(true);
        const order = await findSellerOrderByRequestId(detail.id, "PENDING_SELLER_APPROVAL");
        if (!order) {
          throw new Error("판매자 조직 권한이 없거나 연결 주문이 없습니다.");
        }
        await rejectSellerPurchaseOrder({
          orderId: order.id,
          decisionMessage: reason,
        });
        setDetail((prev) => (prev == null ? prev : { ...prev, status: "REJECTED" }));
        setRejectModalOpen(false);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "요청 반려 처리에 실패했습니다."
        );
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, canDecision, detail]
  );

  const approveModalItems: PurchaseRequestDetailItem[] = useMemo(() => {
    if (!detail) return [];
    return detail.items.map((item) => ({
      id: String(item.id),
      name: item.productNameSnapshot || "상품명 없음",
      category: `판매처 #${item.sellerOrganizationId}`,
      unitPrice: parseAmount(item.unitPriceSnapshot),
      quantity: item.quantity,
      imageUrl: DEFAULT_IMAGE,
    }));
  }, [detail]);

  return (
    <div className="min-h-screen background_background_400_b">
      <HeaderWithCart device={device} isLoggedIn role="admin" />

      <main className={cn(CONTENT_PADDING_X, "pb-12 pt-3.5 md:pt-10")}>
        <div className="mx-auto w-full max-w-[1680px]">
          <h1 className="mb-6 text_3xl_semibold black_black_400_t xl:mb-10">
            구매 요청 관리
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
              <h2 className="text_2xl_bold black_black_400_t">요청 품목</h2>

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
                          <div className="min-w-0 flex flex-1 flex-col justify-center">
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
                <p className="text_2xl_semibold black_black_400_t">총 {totalCount}건</p>
                <p className="whitespace-nowrap text_3xl_bold primary_orange_400_t">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="outlined"
                  disabled={!canDecision || actionLoading}
                  className={cn(
                    "!h-14 !min-w-0 !flex-1 !rounded-[16px] !border-0 text-center text_xl_semibold xl:!h-[72px]",
                    canDecision
                      ? "!bg-[var(--gray-gray-100,#F2F2F2)] !text-[var(--gray-gray-500,#999999)] cursor-pointer"
                      : "!bg-[var(--gray-gray-100,#F2F2F2)] !text-[var(--gray-gray-300,#C4C4C4)] cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!canDecision || actionLoading) return;
                    setRejectModalOpen(true);
                  }}
                >
                  요청 반려
                </Button>
                <Button
                  type="button"
                  variant="solid"
                  disabled={!canDecision || actionLoading || isBudgetExceeded}
                  className={cn(
                    "!h-14 !min-w-0 !flex-1 !rounded-[16px] text-center text_xl_semibold xl:!h-[72px]",
                    canDecision && !isBudgetExceeded
                      ? "gray_gray_50_t cursor-pointer"
                      : "!bg-[var(--gray-gray-300,#C4C4C4)] !text-white cursor-not-allowed"
                  )}
                  onClick={() => {
                    void handleApprove();
                  }}
                >
                  요청 승인
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
                  <h2 className="text_2xl_bold black_black_400_t">요청 정보</h2>
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
                    <InfoField label="요청인" value={resolveRequesterName(detail)} />
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
                  <h2 className="text_2xl_bold black_black_400_t">예산 정보</h2>
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
                    <InfoField
                      label="이번달 지출액"
                      value={monthlySpent != null ? formatPrice(monthlySpent) : "계산 중"}
                    />
                    <InfoField
                      label="이번달 남은 예산"
                      value={
                        monthlyRemaining != null
                          ? formatPrice(monthlyRemaining)
                          : "계산 중"
                      }
                    />
                    {isBudgetExceeded && (
                      <p className="text_md_medium text-[#E53935]">
                        구매 금액이 남은 예산을 초과합니다.
                      </p>
                    )}
                    <InfoField
                      label="구매후 예산"
                      value={
                        purchaseAfterBudget != null
                          ? formatPrice(purchaseAfterBudget)
                          : "계산 중"
                      }
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
          )}
        </div>
      </main>

      <PurchaseApproveModal
        open={approveModalOpen}
        onOpenChange={(open) => {
          setApproveModalOpen(open);
          if (!open) setApproveErrorMessage("");
        }}
        requesterName={detail ? resolveRequesterName(detail) : ""}
        items={approveModalItems}
        remainingBudget={monthlyRemaining ?? 0}
        isSubmitting={actionLoading}
        errorMessage={approveErrorMessage}
        onCancel={() => {}}
        onApprove={(message) => {
          void handleApproveWithReason(message);
        }}
      />

      <ConfirmCancelModal
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        productSummary={detail?.items[0]?.productNameSnapshot ?? "선택한 요청"}
        onConfirm={(reason) => {
          void handleRejectWithReason(reason);
        }}
      />
    </div>
  );
}

export default function PurchaseManageDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen background_background_400_b">
          <main className={cn(CONTENT_PADDING_X, "pb-12 pt-3.5 md:pt-10")}>
            <div className="mx-auto w-full max-w-[1680px]">
              <h1 className="mb-6 text_3xl_semibold black_black_400_t xl:mb-10">
                구매 요청 관리
              </h1>
              <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
                상세 정보를 불러오는 중입니다.
              </div>
            </div>
          </main>
        </div>
      }
    >
      <PurchaseManageDetailContent />
    </Suspense>
  );
}
