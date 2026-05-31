import type { PurchaseRequestDetailItem } from "./api";

const EPS = 0.01;

function parseMoney(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value ?? "").replace(/,/g, "").replace(/\s/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * 품목 줄 금액. `lineTotal`이 단가만인 경우 `unitPrice × quantity`로 보정합니다.
 */
export function computeLineAmountForItem(item: PurchaseRequestDetailItem): number {
  const qty = Number(item.quantity) || 0;
  const unit = parseMoney(item.unitPriceSnapshot);
  const line = parseMoney(item.lineTotal);
  const unitTimesQty = unit * Math.max(0, qty);

  if (qty <= 0) return Math.max(0, line);
  if (
    qty > 1 &&
    unit > 0 &&
    Math.abs(line - unit) <= EPS &&
    Math.abs(unitTimesQty - line) > EPS
  ) {
    return unitTimesQty;
  }
  if (line > 0) return line;
  return unitTimesQty;
}

export function sumPurchaseRequestDetailItemsAmount(
  items: PurchaseRequestDetailItem[],
): number {
  const sum = items.reduce((acc, item) => acc + computeLineAmountForItem(item), 0);
  return Number.isFinite(sum) ? sum : 0;
}
