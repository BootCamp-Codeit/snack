import type { PurchaseRequestDetailResult } from "./api";
import { pickFirstString, pickNestedPersonDisplayName } from "./purchase-request-detail-fields";

export function expenseRangeFromDetailRequestedAt(detail: PurchaseRequestDetailResult): {
  from: string;
  to: string;
} {
  const requested = new Date(detail.requestedAt);
  const y = requested.getFullYear();
  const m = requested.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  const start = new Date(y, m - 1, 1);
  start.setDate(start.getDate() - 31);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return {
    from: toYmd(start),
    to: `${y}-${pad(m)}-${pad(lastDay)}`,
  };
}

/** 목록 등 여러 건의 상세를 한 번에 커버하는 지출 조회 기간 */
export function expenseRangeFromDetails(details: PurchaseRequestDetailResult[]): {
  from: string;
  to: string;
} {
  if (details.length === 0) {
    return expenseRangeFromDetailRequestedAt({
      requestedAt: new Date().toISOString(),
    } as PurchaseRequestDetailResult);
  }
  let minT = Infinity;
  let maxT = -Infinity;
  for (const d of details) {
    const t = new Date(d.requestedAt).getTime();
    if (Number.isFinite(t)) {
      minT = Math.min(minT, t);
      maxT = Math.max(maxT, t);
    }
  }
  if (!Number.isFinite(minT) || !Number.isFinite(maxT)) {
    return expenseRangeFromDetailRequestedAt(details[0]!);
  }
  const minDate = new Date(minT);
  const maxDate = new Date(maxT);
  const y = minDate.getFullYear();
  const m = minDate.getMonth() + 1;
  const lastDayMax = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const start = new Date(y, m - 1, 1);
  start.setDate(start.getDate() - 31);
  return {
    from: toYmd(start),
    to: `${maxDate.getFullYear()}-${pad(maxDate.getMonth() + 1)}-${pad(lastDayMax)}`,
  };
}

export function buildExpenseMaps(rows: Record<string, unknown>[]): {
  requesterByPr: Map<number, string>;
  recordedByByPr: Map<number, string>;
} {
  const requesterByPr = new Map<number, string>();
  const recordedByByPr = new Map<number, string>();
  for (const row of rows) {
    const prId = Number(row.purchaseRequestId ?? row.purchase_request_id);
    if (!Number.isFinite(prId) || prId <= 0) continue;

    const reqFlat =
      pickFirstString(row, [
        "requesterDisplayName",
        "requester_display_name",
        "requesterName",
        "requester_name",
      ]) ?? "";
    const reqNested = pickNestedPersonDisplayName(row, [
      "requester",
      "requesterUser",
      "requester_user",
      "requestedBy",
      "requested_by",
    ]);
    const req = (reqFlat || reqNested || "").trim();
    if (req.length > 0) requesterByPr.set(prId, req);

    const recFlat =
      pickFirstString(row, [
        "recordedByDisplayName",
        "recorded_by_display_name",
        "recordedByName",
        "recorded_by_name",
        "approverName",
        "approver_name",
        "managerName",
        "manager_name",
        "processedByName",
        "processed_by_name",
      ]) ?? "";
    const recNested = pickNestedPersonDisplayName(row, [
      "recordedBy",
      "recorded_by",
      "approver",
      "approvedBy",
      "approved_by",
      "decisionBy",
      "decision_by",
    ]);
    const rec = (recFlat || recNested || "").trim();
    if (rec.length > 0) recordedByByPr.set(prId, rec);
  }
  return { requesterByPr, recordedByByPr };
}
