export type PurchaseRequestSort = "latest" | "amountAsc" | "amountDesc";

export type PurchaseRequestStatus = "pending" | "rejected" | "approved";

export interface PurchaseRequestItem {
  id: string;
  /** 구매 요청 상세 API(`getPurchaseRequestDetail`) 조회용 */
  purchaseRequestId?: number;
  requestDate: string;
  approvalDate: string;
  requester: string;
  manager: string;
  productSummary: string;
  totalQuantity: number;
  totalAmount: number;
  status: PurchaseRequestStatus;
  imageUrl?: string;
}
