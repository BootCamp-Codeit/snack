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
  requestDate: string;
  requester: string;
  productSummary: string;
  totalQuantity: number;
  totalAmount: number;
  status: PurchaseRequestStatus;
  rawStatus: PurchaseRequestRawStatus;
  imageUrl?: string;
}
