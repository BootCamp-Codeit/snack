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
import { cn } from "@/lib/utils";
import {
  cancelPurchaseRequest,
  getPurchaseRequestDetail,
  getPurchaseRequests,
  type PurchaseRequestListItem,
  type PurchaseRequestSortParam,
} from "./_lib/api";

const ITEMS_PER_PAGE = 6;

const STATUS_MAP: Record<PurchaseRequestListItem["status"], PurchaseRequestItem["status"]> = {
  OPEN: "pending",
  PARTIALLY_APPROVED: "pending",
  READY_TO_PURCHASE: "pending",
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
  return {
    id: item.id,
    requestDate: formatDate(item.requestedAt),
    productSummary: item.itemCount > 0 ? `요청 품목 ${item.itemCount}건` : "요청 품목 없음",
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

export default function PurchaseRequestsPage() {
  const device = useDevice();
  const { isLoggedIn, role } = useAuthHeader();
  const [sort, setSort] = useState<PurchaseRequestSort>("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<PurchaseRequestItem | null>(null);
  const [items, setItems] = useState<PurchaseRequestItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
            const firstItemName = detail.items[0]?.productNameSnapshot;
            const totalQuantity = detail.items.reduce((sum, item) => sum + item.quantity, 0);
            return {
              ...base,
              productSummary: buildProductSummary(firstItemName, detail.itemCount),
              totalQuantity,
            };
          } catch {
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
  }, []);

  useEffect(() => {
    void fetchList(currentPage, sort);
  }, [currentPage, sort, fetchList]);

  const handleCancelRequest = useCallback((item: PurchaseRequestItem) => {
    setCancelTarget(item);
    setModalOpen(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      await cancelPurchaseRequest(cancelTarget.id);
      await fetchList(currentPage, sort);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "요청 취소에 실패했습니다."
      );
    }
    setCancelTarget(null);
  }, [cancelTarget, currentPage, fetchList, sort]);

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
              구매 요청 내역
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
                    />
                  ))}
                </div>
              ) : (
                <PurchaseRequestTable
                  key={currentPage}
                  items={items}
                  onCancelRequest={handleCancelRequest}
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
    </div>
  );
}
