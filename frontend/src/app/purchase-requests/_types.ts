/** 정렬: 최신순 | 낮은금액순 | 높은금액순 */
export type PurchaseRequestSort = "latest" | "amountAsc" | "amountDesc";

/** 상태: 승인 대기 | 구매 반려 | 승인 완료 */
export type PurchaseRequestStatus = "pending" | "rejected" | "approved";
export type PurchaseRequestRawStatus =
  | "OPEN"
  | "PARTIALLY_APPROVED"
  | "READY_TO_PURCHASE"
  | "REJECTED"
  | "CANCELED"
  | "PURCHASED";

export interface PurchaseRequestItem {
  id: number;
  requestDate: string; // 2024.07.04
  productSummary: string; // "코카콜라 제로 외 1건"
  totalQuantity: number;
  totalAmount: number;
  status: PurchaseRequestStatus;
  rawStatus: PurchaseRequestRawStatus;
  imageUrl?: string; // 썸네일
}
