"use client";

import { invalidateExpensesClientCache } from "@/app/budget-mng/_components/_lib/api";
import { AUTH_ACCESS_TOKEN_KEY } from "@/lib/auth/constants";
import { API_BASE_URL } from "@/lib/env";

export type SellerOrderStatus =
  | "PENDING_SELLER_APPROVAL"
  | "APPROVED"
  | "PURCHASED"
  | "REJECTED"
  | "CANCELED";

export interface SellerOrderListItem {
  id: number;
  status: SellerOrderStatus;
  purchaseRequestId: number;
  buyerOrganizationId: number;
  itemsAmount: string;
  createdAt: string;
  purchaseRequestStatus: string;
}

export interface SellerOrderListResult {
  data: SellerOrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function resolveOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const raw =
    payload?.organizationId ??
    payload?.organization_id ??
    payload?.orgId ??
    payload?.org_id;
  if (raw === undefined || raw === null) return null;
  const value = String(raw).trim();
  return value.length > 0 ? value : null;
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
  const orgId = resolveOrganizationIdFromToken(token);
  const isSameOriginProxy =
    path.startsWith("/api/seller/purchase-orders") ||
    path.startsWith("/api/expenses");
  const target = isSameOriginProxy ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(target, {
    ...init,
    ...(isSameOriginProxy ? { credentials: "include" } : {}),
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(orgId ? { "X-Organization-Id": orgId } : {}),
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

export async function getSellerPurchaseOrders(params: {
  page: number;
  limit: number;
  status?: SellerOrderStatus;
}): Promise<SellerOrderListResult> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.status ? { status: params.status } : {}),
  });

  const payload = await requestApi<unknown>(
    `/api/seller/purchase-orders?${query.toString()}`
  );
  const data = getDataPayload(payload);

  if (!data || typeof data !== "object") {
    return { data: [], total: 0, page: params.page, limit: params.limit, totalPages: 1 };
  }

  const record = data as Record<string, unknown>;
  return {
    data: Array.isArray(record.data) ? (record.data as SellerOrderListItem[]) : [],
    total: Number(record.total ?? 0),
    page: Number(record.page ?? params.page),
    limit: Number(record.limit ?? params.limit),
    totalPages: Math.max(1, Number(record.totalPages ?? 1)),
  };
}

export async function approveSellerPurchaseOrder(params: {
  orderId: number;
  decisionMessage?: string;
  shippingFee?: string;
}): Promise<unknown> {
  const payload = await requestApi<unknown>(
    `/api/seller/purchase-orders/${params.orderId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({
        ...(params.decisionMessage ? { decisionMessage: params.decisionMessage } : {}),
        ...(params.shippingFee ? { shippingFee: params.shippingFee } : {}),
      }),
    }
  );
  return getDataPayload(payload);
}

export async function rejectSellerPurchaseOrder(params: {
  orderId: number;
  decisionMessage?: string;
}): Promise<unknown> {
  const payload = await requestApi<unknown>(
    `/api/seller/purchase-orders/${params.orderId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({
        ...(params.decisionMessage ? { decisionMessage: params.decisionMessage } : {}),
      }),
    }
  );
  return getDataPayload(payload);
}

export async function completeSellerPurchaseOrder(params: {
  orderId: number;
  shippingFee?: string;
}): Promise<unknown> {
  const payload = await requestApi<unknown>(
    `/api/seller/purchase-orders/${params.orderId}/record-purchase`,
    {
      method: "POST",
      body: JSON.stringify({
        platform: "OTHER",
        note: "관리자 승인 처리",
        ...(params.shippingFee ? { shippingFee: params.shippingFee } : {}),
      }),
    }
  );
  return getDataPayload(payload);
}

export async function createExpenseFromSellerOrder(params: {
  orderId: number;
  itemsAmount: number;
  shippingAmount?: number;
  note?: string;
}): Promise<unknown | null> {
  try {
    const payload = await requestApi<unknown>("/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        purchaseOrderId: params.orderId,
        itemsAmount: params.itemsAmount,
        shippingAmount: params.shippingAmount ?? 0,
        ...(params.note ? { note: params.note } : {}),
      }),
    });
    invalidateExpensesClientCache();
    return getDataPayload(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "지출 생성에 실패했습니다.";
    // 이미 지출이 등록된 주문은 승인 플로우를 막지 않습니다.
    if (message.includes("이미 등록")) {
      invalidateExpensesClientCache();
      return null;
    }
    throw error;
  }
}
