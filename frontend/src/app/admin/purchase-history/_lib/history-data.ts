import { ensureAccessTokenFresh } from "@/lib/auth/ensure-access-token";
import { fetchExpenseRecordsByDateRange } from "@/app/budget-mng/_components/_lib/api";
import { fetchMemberNameByIdMap } from "@/app/members/_lib/member-name-map";
import {
  getPurchaseRequestDetail,
  type PurchaseRequestDetailResult,
} from "@/app/purchase-requests/_lib/api";
import {
  buildExpenseMaps,
  expenseRangeFromDetails,
} from "@/app/purchase-requests/_lib/purchase-expense-maps";
import {
  buildPurchaseRequestProductSummary,
  resolveApproverWithExpenseFallback,
  resolveRequesterWithMemberMap,
} from "@/app/purchase-requests/_lib/purchase-request-detail-fields";
import {
  getSellerPurchaseOrders,
  type SellerOrderListItem,
} from "@/app/admin/purchase-manage/_lib/seller-order-api";
import type { PurchaseRequestItem, PurchaseRequestSort } from "../_types";

export function formatHistoryDate(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function toHistoryItem(raw: Record<string, unknown>): PurchaseRequestItem | null {
  const itemList = Array.isArray(raw.items) ? (raw.items as Record<string, unknown>[]) : [];
  const firstItem = itemList[0] ?? {};
  const id = String(raw.id ?? raw.orderId ?? raw.purchaseOrderId ?? "").trim();
  if (!id) return null;
  const totalQuantity =
    Number(raw.totalQuantity ?? raw.quantity ?? raw.totalCount) ||
    itemList.reduce((acc, cur) => acc + Number(cur.quantity ?? 0), 0);
  const totalAmount = Number(
    raw.totalAmount ?? raw.amount ?? raw.totalPrice ?? raw.itemsAmount ?? 0,
  );
  const productName =
    String(
      raw.productSummary ??
        raw.productName ??
        firstItem.productName ??
        firstItem.name ??
        "구매 품목",
    ).trim() || "구매 품목";
  const summary =
    itemList.length > 1 ? `${productName} 외 ${itemList.length - 1}건` : productName;

  const prRaw = raw.purchaseRequestId;
  const purchaseRequestId =
    typeof prRaw === "number" && Number.isFinite(prRaw) && prRaw > 0
      ? prRaw
      : typeof prRaw === "string"
        ? Number(prRaw)
        : undefined;

  return {
    id,
    ...(purchaseRequestId !== undefined &&
    Number.isFinite(purchaseRequestId) &&
    purchaseRequestId > 0
      ? { purchaseRequestId }
      : {}),
    requestDate: formatHistoryDate(raw.requestedAt ?? raw.requestDate ?? raw.createdAt),
    approvalDate: formatHistoryDate(raw.approvedAt ?? raw.approvalDate ?? raw.updatedAt),
    requester: String(
      raw.requesterName ?? raw.requester ?? raw.requestedByName ?? "요청자",
    ),
    manager: String(raw.managerName ?? raw.approverName ?? raw.manager ?? "담당자"),
    productSummary: summary,
    totalQuantity: Number.isFinite(totalQuantity) ? totalQuantity : 0,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    status: "approved",
    imageUrl:
      typeof firstItem.imageUrl === "string"
        ? firstItem.imageUrl
        : typeof firstItem.thumbnailUrl === "string"
          ? firstItem.thumbnailUrl
          : undefined,
  };
}

function sellerOrderToHistoryItem(order: SellerOrderListItem): PurchaseRequestItem | null {
  return toHistoryItem({
    id: String(order.id),
    purchaseRequestId: order.purchaseRequestId,
    createdAt: order.createdAt,
    updatedAt: order.createdAt,
    itemsAmount: order.itemsAmount,
    totalAmount: Number(order.itemsAmount),
    productSummary: `구매 요청 #${order.purchaseRequestId}`,
    requesterName: "—",
    managerName: "—",
  });
}

function mergeSellerOrderWithDetail(
  order: SellerOrderListItem,
  detail: PurchaseRequestDetailResult,
  memberNameById: Record<number, string>,
  expenseMaps: ReturnType<typeof buildExpenseMaps>,
): PurchaseRequestItem {
  const amountOrder = Number(order.itemsAmount);
  const amountDetail = Number(detail.totalAmount ?? 0);
  const totalAmount =
    Number.isFinite(amountOrder) && amountOrder > 0 ? amountOrder : amountDetail;

  const totalQuantity = detail.items.reduce((sum, item) => sum + item.quantity, 0);

  let requester = resolveRequesterWithMemberMap(detail, memberNameById);
  if (requester.startsWith("사용자 #")) {
    const fromExpense = expenseMaps.requesterByPr.get(detail.id);
    if (fromExpense) requester = fromExpense;
  }

  const manager = resolveApproverWithExpenseFallback(
    detail,
    detail.id,
    expenseMaps.recordedByByPr,
  );

  return {
    id: String(order.id),
    purchaseRequestId: order.purchaseRequestId,
    approvalDate: formatHistoryDate(detail.decisionAt ?? detail.updatedAt ?? order.createdAt),
    productSummary: buildPurchaseRequestProductSummary(detail),
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    requester,
    manager,
    requestDate: formatHistoryDate(detail.requestedAt),
    totalQuantity: Number.isFinite(totalQuantity) ? totalQuantity : 0,
    status: "approved",
  };
}

async function fetchAllHistorySellerOrders(): Promise<SellerOrderListItem[]> {
  const statuses = ["PURCHASED", "APPROVED"] as const satisfies readonly SellerOrderListItem["status"][];
  const seen = new Set<number>();
  const orders: SellerOrderListItem[] = [];

  for (const status of statuses) {
    let page = 1;
    let totalPages = 1;
    while (page <= totalPages) {
      const res = await getSellerPurchaseOrders({ page, limit: 100, status });
      totalPages = res.totalPages;
      for (const o of res.data) {
        if (!seen.has(o.id)) {
          seen.add(o.id);
          orders.push(o);
        }
      }
      page += 1;
    }
  }
  return orders;
}

/** 구매 승인·구매기록 완료 후에는 주문이 `PURCHASED`가 되므로, 내역에는 `PURCHASED`와 `APPROVED`를 모두 포함합니다. */
export async function fetchApprovedPurchaseHistory(): Promise<PurchaseRequestItem[]> {
  if (typeof window === "undefined") return [];
  const okSession = await ensureAccessTokenFresh();
  if (!okSession) throw new Error("로그인이 필요합니다.");

  const [memberNameById, orders] = await Promise.all([
    fetchMemberNameByIdMap(),
    fetchAllHistorySellerOrders(),
  ]);

  const uniqueRequestIds = [...new Set(orders.map((o) => o.purchaseRequestId))];
  const detailByRequestId = new Map<number, PurchaseRequestDetailResult>();
  await Promise.all(
    uniqueRequestIds.map(async (rid) => {
      try {
        detailByRequestId.set(rid, await getPurchaseRequestDetail(rid));
      } catch {
        // 상세 없으면 주문만으로 폴백
      }
    }),
  );

  const allDetails = [...detailByRequestId.values()];
  let expenseMaps = buildExpenseMaps([]);
  if (allDetails.length > 0) {
    try {
      const rows = await fetchExpenseRecordsByDateRange(expenseRangeFromDetails(allDetails));
      expenseMaps = buildExpenseMaps(rows);
    } catch {
      expenseMaps = buildExpenseMaps([]);
    }
  }

  return orders
    .map((order) => {
      const detail = detailByRequestId.get(order.purchaseRequestId);
      if (detail)
        return mergeSellerOrderWithDetail(order, detail, memberNameById, expenseMaps);
      return sellerOrderToHistoryItem(order);
    })
    .filter((v): v is PurchaseRequestItem => Boolean(v));
}

export function sortPurchaseHistoryItems(
  items: PurchaseRequestItem[],
  sort: PurchaseRequestSort,
): PurchaseRequestItem[] {
  const copy = [...items];
  if (sort === "latest") {
    copy.sort((a, b) => (b.requestDate > a.requestDate ? 1 : -1));
  } else if (sort === "amountAsc") {
    copy.sort((a, b) => a.totalAmount - b.totalAmount);
  } else {
    copy.sort((a, b) => b.totalAmount - a.totalAmount);
  }
  return copy;
}

export function paginateList<T>(list: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return list.slice(start, start + perPage);
}
