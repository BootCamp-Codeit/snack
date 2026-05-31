import type { PurchaseRequestDetailResult } from "./api";

export function pickFirstString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function pickNestedPersonDisplayName(
  record: Record<string, unknown>,
  objectKeys: string[],
): string | null {
  const nestedNameKeys = [
    "displayName",
    "display_name",
    "name",
    "userName",
    "user_name",
    "fullName",
    "full_name",
    "memberName",
    "member_name",
    "nickname",
  ];
  for (const key of objectKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value && typeof value === "object") {
      const fromNested = pickFirstString(value as Record<string, unknown>, nestedNameKeys);
      if (fromNested) return fromNested;
    }
  }
  return null;
}

const REQUESTER_NESTED_OBJECT_KEYS = [
  "requester",
  "requesterUser",
  "requester_user",
  "requestedBy",
  "requested_by",
] as const;

/** API가 camelCase / snake_case / 중첩 객체로 줄 때 공통으로 식별자 추출 */
export function resolveRequesterUserId(detail: PurchaseRequestDetailResult): number {
  const raw = detail as unknown as Record<string, unknown>;
  const n = Number(
    raw.requesterUserId ??
      raw.requester_user_id ??
      raw.requestedByUserId ??
      raw.requested_by_user_id ??
      detail.requesterUserId,
  );
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function resolveRequesterDisplayName(detail: PurchaseRequestDetailResult): string {
  const raw = detail as unknown as Record<string, unknown>;
  const fromFlat =
    pickFirstString(raw, [
      "requesterName",
      "requester_name",
      "requesterDisplayName",
      "requester_display_name",
      "requesterUserName",
      "requester_user_name",
      "requestedByName",
      "requested_by_name",
    ]) ?? null;
  const fromNested = pickNestedPersonDisplayName(raw, [...REQUESTER_NESTED_OBJECT_KEYS]);
  const direct =
    fromFlat ??
    fromNested ??
    detail.requesterName ??
    detail.requesterDisplayName ??
    detail.requesterUserName ??
    detail.requester?.displayName ??
    detail.requester?.name ??
    detail.requesterUser?.displayName ??
    detail.requesterUser?.name;
  const name = typeof direct === "string" ? direct.trim() : "";
  if (name) return name;
  const uid = resolveRequesterUserId(detail);
  return uid > 0 ? `사용자 #${uid}` : "-";
}

export function resolveRequesterWithMemberMap(
  detail: PurchaseRequestDetailResult,
  memberNameById: Record<number, string>,
): string {
  const base = resolveRequesterDisplayName(detail);
  if (!base.startsWith("사용자 #")) return base;
  const uid = resolveRequesterUserId(detail);
  const mapped = uid > 0 ? memberNameById[uid]?.trim() : "";
  return mapped && mapped.length > 0 ? mapped : base;
}

export function resolveApproverDisplayName(detail: PurchaseRequestDetailResult): string {
  const raw = detail as unknown as Record<string, unknown>;
  const managerFlat = pickFirstString(raw, [
    "approverName",
    "approver_name",
    "approverUserName",
    "managerName",
    "approvedByName",
    "approved_by_name",
    "approvedByDisplayName",
    "decidedByName",
    "decided_by_name",
    "decisionByName",
    "decision_by_name",
    "decisionByDisplayName",
    "processorName",
    "reviewerName",
    "manager",
    "recordedByDisplayName",
    "recorded_by_display_name",
    "recordedByName",
  ]);
  const managerNested = pickNestedPersonDisplayName(raw, [
    "approver",
    "approverUser",
    "approvedBy",
    "approvedByUser",
    "decisionBy",
    "decisionByUser",
    "decidedBy",
    "recordedBy",
    "reviewer",
    "handler",
  ]);
  const name = (managerFlat ?? managerNested ?? "").trim();
  return name.length > 0 ? name : "-";
}

export function resolveApproverWithExpenseFallback(
  detail: PurchaseRequestDetailResult,
  purchaseRequestId: number,
  recordedByByPurchaseRequestId: ReadonlyMap<number, string>,
): string {
  let manager = resolveApproverDisplayName(detail);
  if (manager === "-") {
    const fromExpense = recordedByByPurchaseRequestId.get(purchaseRequestId);
    if (fromExpense) manager = fromExpense;
  }
  return manager;
}

/** 구매 내역 목록 등 — 첫 품목명 + `외 N건` (API 필드명 변형 대응) */
export function buildPurchaseRequestProductSummary(detail: PurchaseRequestDetailResult): string {
  const firstItem = detail.items.find((item) => {
    const raw = item as unknown as Record<string, unknown>;
    const name =
      pickFirstString(raw, [
        "productNameSnapshot",
        "product_name_snapshot",
        "productName",
        "product_name",
        "name",
      ]) ?? "";
    return name.trim().length > 0;
  });
  const count = detail.items.length;
  if (!firstItem) {
    return count > 0 ? `요청 품목 ${count}건` : "요청 품목 없음";
  }
  const raw = firstItem as unknown as Record<string, unknown>;
  const firstItemName =
    pickFirstString(raw, [
      "productNameSnapshot",
      "product_name_snapshot",
      "productName",
      "product_name",
      "name",
    ])?.trim() ?? "";
  const remain = Math.max(0, count - 1);
  return remain > 0 ? `${firstItemName} 외 ${remain}건` : firstItemName;
}
