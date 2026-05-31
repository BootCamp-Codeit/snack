export interface PurchaseRequestDetailItem {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface PurchaseRequestInfo {
  requestDate: string;
  requester: string;
  requestMessage: string;
}

export interface ApprovalInfo {
  approvalDate: string;
  manager: string;
  status: string;
  resultMessage: string;
}
