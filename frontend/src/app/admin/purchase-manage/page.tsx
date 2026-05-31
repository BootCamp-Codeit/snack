"use client";

import { useState, useCallback, useEffect } from "react";
import { CONTENT_PADDING_X } from "@/components/header";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import { useAuthHeader } from "@/hooks/use-auth-header";
import { useDevice } from "@/hooks/use-device";
import Pagination from "@/components/ui/pagination";
import type { PurchaseRequestItem, PurchaseRequestSort } from "./_types";
import { SortDropdown } from "./_components/SortDropdown";
import { PurchaseRequestTable } from "./_components/PurchaseRequestTable";
import { PurchaseRequestCard } from "./_components/PurchaseRequestCard";
import { EmptyState } from "./_components/EmptyState";
import { ConfirmCancelModal } from "./_components/ConfirmCancelModal";
import { PurchaseApproveModal } from "./_components/PurchaseApproveModal";
import { cn } from "@/lib/utils";
import {
  getPurchaseRequestDetail,
  getPurchaseRequests,
  type PurchaseRequestListItem,
  type PurchaseRequestSortParam,
} from "@/app/purchase-requests/_lib/api";
import { fetchMemberNameByIdMap } from "@/app/members/_lib/member-name-map";
import {
  approveSellerPurchaseOrder,
  completeSellerPurchaseOrder,
  createExpenseFromSellerOrder,
  getSellerPurchaseOrders,
  rejectSellerPurchaseOrder,
  type SellerOrderListItem,
} from "./_lib/seller-order-api";
import type { PurchaseRequestDetailItem } from "./detail/_types";
import { getBudgetSummary } from "./_lib/budget-api";

const ITEMS_PER_PAGE = 6;

const STATUS_MAP: Record<PurchaseRequestListItem["status"], PurchaseRequestItem["status"]> = {
  OPEN: "pending",
  PARTIALLY_APPROVED: "pending",
  READY_TO_PURCHASE: "approved",
  REJECTED: "rejected",
  CANCELED: "rejected",
  PURCHASED: "approved",
};

function toSortParam(sort: PurchaseRequestSort): PurchaseRequestSortParam {
  if (sort === "amountAsc") return "totalAmount_asc";
  if (sort === "amountDesc") return "totalAmount_desc";
  return "requestedAt_desc";
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function parseAmount(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function mapToUiItem(item: PurchaseRequestListItem): PurchaseRequestItem {
  const requesterName = String(
    item.requesterName ??
    item.requesterDisplayName ??
    item.requesterUserName ??
    ""
  ).trim();
  const unknownSummary =
    item.itemCount <= 0
      ? "요청 품목 없음"
      : item.itemCount === 1
        ? "상품명 확인 중"
        : `상품명 확인 중 외 ${item.itemCount - 1}건`;

  return {
    id: item.id,
    requestDate: formatDate(item.requestedAt),
    requester: requesterName || "요청자",
    productSummary: unknownSummary,
    totalQuantity: item.itemCount,
    totalAmount: parseAmount(item.totalAmount),
    status: STATUS_MAP[item.status],
    rawStatus: item.status,
  };
}

function buildProductSummary(firstItemName: string | undefined, itemCount: number): string {
  const name = firstItemName?.trim();
  if (!name) return itemCount > 0 ? `요청 품목 ${itemCount}건` : "요청 품목 없음";
  const remain = Math.max(0, itemCount - 1);
  return remain > 0 ? `${name} 외 ${remain}건` : name;
}

function pickRequesterUserId(item: PurchaseRequestListItem): number | null {
  const n = Number(
    item.requesterUserId ??
      item.requesterId ??
      item.requestedByUserId ??
      NaN
  );
  return Number.isFinite(n) && n > 0 ? n : null;
}

function mapModalItems(
  detailItems: Awaited<ReturnType<typeof getPurchaseRequestDetail>>["items"]
): PurchaseRequestDetailItem[] {
  return detailItems.map((detailItem) => ({
    id: String(detailItem.id),
    name: detailItem.productNameSnapshot || "상품명 없음",
    category: "카테고리 정보 없음",
    unitPrice: parseAmount(detailItem.unitPriceSnapshot),
    quantity: detailItem.quantity,
    imageUrl: "/assets/purchase_request_details/cola.png",
  }));
}

function resolveRequesterName(detail: Awaited<ReturnType<typeof getPurchaseRequestDetail>>): string {
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

export default function PurchaseManagePage() {
  const device = useDevice();
  const { isLoggedIn, role } = useAuthHeader();
  const [sort, setSort] = useState<PurchaseRequestSort>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PurchaseRequestItem | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<PurchaseRequestItem | null>(
    null
  );
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [approveItems, setApproveItems] = useState<PurchaseRequestDetailItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [approveErrorMessage, setApproveErrorMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState<number>(0);
  const [memberNameById, setMemberNameById] = useState<Record<number, string>>({});

  const fetchList = useCallback(async (page: number, currentSort: PurchaseRequestSort) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getPurchaseRequests({
        page,
        limit: ITEMS_PER_PAGE,
        sort: toSortParam(currentSort),
      });

      const enrichedItems = await Promise.all(
        response.data.map(async (row) => {
          const base = mapToUiItem(row);
          try {
            const detail = await getPurchaseRequestDetail(row.id);
            const firstItemName = detail.items.find(
              (item) => item.productNameSnapshot?.trim().length > 0
            )?.productNameSnapshot;
            const totalQuantity = detail.items.reduce((sum, item) => sum + item.quantity, 0);
            return {
              ...base,
              requester:
                (() => {
                  const byDetail = resolveRequesterName(detail);
                  if (!byDetail.startsWith("사용자 #")) return byDetail;
                  const mapped = memberNameById[detail.requesterUserId];
                  return mapped?.trim() || byDetail;
                })(),
              productSummary: buildProductSummary(firstItemName, detail.itemCount),
              totalQuantity,
            };
          } catch {
            const requesterId = pickRequesterUserId(row);
            if (requesterId && memberNameById[requesterId]) {
              return { ...base, requester: memberNameById[requesterId] };
            }
            return base;
          }
        })
      );

      setItems(enrichedItems);
      setTotalPages(Math.max(1, response.totalPages));
      if (page > response.totalPages && response.totalPages > 0) {
        setCurrentPage(response.totalPages);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "목록을 불러오지 못했습니다."
      );
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [memberNameById]);

  useEffect(() => {
    let cancelled = false;
    fetchMemberNameByIdMap()
      .then((next) => {
        if (cancelled) return;
        setMemberNameById(next);
      })
      .catch(() => {
        // 요청인 이름 보강 실패 시에도 목록 렌더는 계속 진행
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchMonthlyRemainingBudget = useCallback(async () => {
    const now = new Date();
    const summary = await getBudgetSummary({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });
    const parsed = Number(summary.remainingAmount);
    setRemainingBudget(Number.isFinite(parsed) ? parsed : 0);
  }, []);

  useEffect(() => {
    void fetchList(currentPage, sort);
  }, [currentPage, sort, fetchList]);

  useEffect(() => {
    fetchMonthlyRemainingBudget().catch((error) => {
      setErrorMessage(
        error instanceof Error ? error.message : "남은 예산을 불러오지 못했습니다."
      );
    });
  }, [fetchMonthlyRemainingBudget]);

  const handleCancelRequest = useCallback((item: PurchaseRequestItem) => {
    setCancelTarget(item);
    setModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async (reason: string) => {
    if (!cancelTarget || actionLoading) return;
    try {
      setActionLoading(true);
      const order = await findSellerOrderByRequestId(
        cancelTarget.id,
        "PENDING_SELLER_APPROVAL"
      );
      if (!order) {
        throw new Error("판매자 조직 권한이 없거나 연결 주문이 없습니다.");
      }
      await rejectSellerPurchaseOrder({ orderId: order.id, decisionMessage: reason });
      await fetchList(currentPage, sort);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "요청 반려 처리에 실패했습니다."
      );
    } finally {
      setActionLoading(false);
    }
    setCancelTarget(null);
  }, [actionLoading, cancelTarget, currentPage, fetchList, sort]);

  const handleApproveRequest = useCallback(async (item: PurchaseRequestItem) => {
    setApproveTarget(item);
    setApproveErrorMessage("");
    setApproveItems([]);
    try {
      const detail = await getPurchaseRequestDetail(item.id);
      setApproveItems(mapModalItems(detail.items));
    } catch {
      setApproveItems([]);
    }
    setApproveModalOpen(true);
  }, []);

  const isMobile = device === "mobile";

  return (
    <div className="min-h-screen background_background_400_b">
      <HeaderWithCart
        device={device}
        isLoggedIn={isLoggedIn}
        role={role}
      />

      <main className={cn(CONTENT_PADDING_X, "pb-12 pt-3.5 md:pt-10")}>
        <div className="mx-auto w-full max-w-[1680px]">
          <div className="mb-4 flex items-center justify-between md:mb-10">
            <h1 className="font-[Pretendard] text-[20px] font-semibold leading-[32px] text-[var(--black-black-400,#1F1F1F)] md:text-[32px] md:leading-[42px]">
              구매 요청 관리
            </h1>
            <SortDropdown value={sort} onChange={setSort} />
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
              {errorMessage}
            </div>
          ) : loading ? (
            <div className="rounded-xl border border-[var(--gray-gray-200)] bg-white px-5 py-4 text-sm text-[var(--black-black-100,#6B6B6B)]">
              목록을 불러오는 중입니다.
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {isMobile ? (
                <div
                  key={currentPage}
                  className="-mx-[clamp(24px,6.25vw,120px)] md:mx-0"
                >
                  {items.map((item) => (
                    <PurchaseRequestCard
                      key={item.id}
                      item={item}
                      onCancelRequest={handleCancelRequest}
                      onApproveRequest={handleApproveRequest}
                    />
                  ))}
                </div>
              ) : (
                <PurchaseRequestTable
                  key={currentPage}
                  items={items}
                  onCancelRequest={handleCancelRequest}
                  onApproveRequest={handleApproveRequest}
                />
              )}

              <div className="mt-6 flex w-full flex-col items-center justify-center sm:mt-8 sm:flex-row sm:justify-center">
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    size="sm"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <ConfirmCancelModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setCancelTarget(null);
        }}
        productSummary={cancelTarget?.productSummary ?? ""}
        onConfirm={handleConfirmCancel}
      />

      <PurchaseApproveModal
        open={approveModalOpen}
        onOpenChange={(open) => {
          setApproveModalOpen(open);
          if (!open) {
            setApproveTarget(null);
            setApproveErrorMessage("");
          }
        }}
        requesterName={approveTarget?.requester ?? ""}
        items={approveItems}
        remainingBudget={remainingBudget}
        isSubmitting={actionLoading}
        errorMessage={approveErrorMessage}
        onCancel={() => {}}
        onApprove={async (message) => {
          if (!approveTarget || actionLoading) return;
          try {
            setActionLoading(true);
            setApproveErrorMessage("");
            const approvedOrder = await findSellerOrderByRequestId(
              approveTarget.id,
              "APPROVED"
            );
            const pendingOrder = approvedOrder
              ? null
              : await findSellerOrderByRequestId(approveTarget.id, "PENDING_SELLER_APPROVAL");
            if (!approvedOrder && !pendingOrder) {
              throw new Error("판매자 조직 권한이 없거나 연결 주문이 없습니다.");
            }
            if (pendingOrder) {
              await approveSellerPurchaseOrder({
                orderId: pendingOrder.id,
                decisionMessage: message || undefined,
              });
            }
            const recordTargetOrder =
              (await findSellerOrderByRequestId(approveTarget.id, "APPROVED")) ??
              approvedOrder ??
              null;
            if (!recordTargetOrder) {
              throw new Error("주문 승인 상태 확인 후 다시 시도해주세요.");
            }
            await completeSellerPurchaseOrder({
              orderId: recordTargetOrder.id,
            });
            await createExpenseFromSellerOrder({
              orderId: recordTargetOrder.id,
              itemsAmount: approveTarget.totalAmount,
              note: "관리자 구매 승인 처리",
            });
            await fetchMonthlyRemainingBudget();
            setApproveModalOpen(false);
            setApproveTarget(null);
            setApproveErrorMessage("");
            await fetchList(currentPage, sort);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "요청 승인 처리에 실패했습니다.";
            setApproveErrorMessage(message);
            setErrorMessage(message);
          } finally {
            setActionLoading(false);
          }
        }}
      />
    </div>
  );
}
