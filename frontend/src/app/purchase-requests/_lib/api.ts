"use client";

import { AUTH_ACCESS_TOKEN_KEY } from "@/lib/auth/constants";
import { API_BASE_URL } from "@/lib/env";

export type PurchaseRequestSortParam =
  | "requestedAt_desc"
  | "totalAmount_asc"
  | "totalAmount_desc";

export interface PurchaseRequestListItem {
  id: number;
  status: "OPEN" | "PARTIALLY_APPROVED" | "READY_TO_PURCHASE" | "REJECTED" | "CANCELED" | "PURCHASED";
  totalAmount: string;
  requestedAt: string;
  canceledAt: string | null;
  itemCount: number;
  requesterUserId?: number;
  requesterId?: number;
  requestedByUserId?: number;
  requesterName?: string | null;
  requesterDisplayName?: string | null;
  requesterUserName?: string | null;
}

export interface PurchaseRequestListResult {
  data: PurchaseRequestListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseRequestDetailItem {
  id: number;
  sellerOrganizationId: number;
  productId: number | null;
  productNameSnapshot: string;
  productUrlSnapshot: string | null;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
  createdAt: string;
}

export interface PurchaseRequestDetailResult extends PurchaseRequestListItem {
  buyerOrganizationId: number;
  requesterUserId: number;
  requesterName?: string | null;
  requesterDisplayName?: string | null;
  requesterUserName?: string | null;
  requester?: { name?: string | null; displayName?: string | null } | null;
  requesterUser?: { name?: string | null; displayName?: string | null } | null;
  requestMessage: string | null;
  updatedAt: string;
  decisionMessage?: string | null;
  approverName?: string | null;
  decisionAt?: string | null;
  items: PurchaseRequestDetailItem[];
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken")
  );
}

function getDataPayload(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }
  return payload;
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string") return payload.trim() || fallback;
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const message = record.message;
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message) && message.length > 0) return String(message[0]);
  return fallback;
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = text;
    }
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(json, "요청 처리에 실패했습니다."));
  }
  return json as T;
}

export async function getPurchaseRequests(params: {
  page: number;
  limit: number;
  sort: PurchaseRequestSortParam;
}): Promise<PurchaseRequestListResult> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sort: params.sort,
  });
  const payload = await requestApi<unknown>(`/api/purchase-requests?${query.toString()}`);
  const data = getDataPayload(payload);
  if (!data || typeof data !== "object") {
    return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 1 };
  }
  const record = data as Record<string, unknown>;
  return {
    data: Array.isArray(record.data) ? (record.data as PurchaseRequestListItem[]) : [],
    total: Number(record.total ?? 0),
    page: Number(record.page ?? params.page),
    limit: Number(record.limit ?? params.limit),
    totalPages: Math.max(1, Number(record.totalPages ?? 1)),
  };
}

export async function getPurchaseRequestDetail(id: number): Promise<PurchaseRequestDetailResult> {
  const payload = await requestApi<unknown>(`/api/purchase-requests/${id}`);
  return getDataPayload(payload) as PurchaseRequestDetailResult;
}

export async function cancelPurchaseRequest(id: number): Promise<PurchaseRequestDetailResult> {
  const payload = await requestApi<unknown>(`/api/purchase-requests/${id}/cancel`, {
    method: "POST",
  });
  return getDataPayload(payload) as PurchaseRequestDetailResult;
}
