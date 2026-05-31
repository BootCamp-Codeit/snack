import { AUTH_ACCESS_TOKEN_KEY } from "@/lib/auth/constants";
import type {
  ApiSuccessResponse,
  GetProductRegistrationsParams,
  GetProductRegistrationsResult,
  ProductApiSort,
  ProductListItemDto,
  ProductListPayloadDto,
  ProductRegistration,
  ProductSort,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://snack-xlvk.onrender.com";

const PRODUCT_SORT_TO_API_SORT: Record<ProductSort, ProductApiSort> = {
  최신순: "createdAt_desc",
  낮은가격순: "price_asc",
  높은가격순: "price_desc",
};

function getAccessToken() {
  if (typeof window === "undefined") {
    throw new Error("브라우저에서만 상품 목록을 조회할 수 있습니다.");
  }

  const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)?.trim();
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  return token;
}

function formatRegisteredAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}`;
}

function toFallbackImageUrl(name: string) {
  const label = encodeURIComponent(name.trim().slice(0, 2) || "SN");
  return `https://placehold.co/80x80/F3F4F6/9CA3AF?text=${label}`;
}

function toProductImageUrl(imageKey: string | null, name: string) {
  if (imageKey && /^https?:\/\//i.test(imageKey)) {
    return imageKey;
  }

  return toFallbackImageUrl(name);
}

function mapProductRegistration(item: ProductListItemDto): ProductRegistration {
  return {
    id: item.id,
    registeredAt: formatRegisteredAt(item.createdAt),
    name: item.name,
    imageUrl: toProductImageUrl(item.imageKey, item.name),
    category: item.category?.name ?? "-",
    price: Number(item.price),
    productLink: item.productUrl,
  };
}

async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
    }
    if (response.status === 403) {
      throw new Error("상품 목록을 조회할 권한이 없습니다.");
    }
    throw new Error("상품 정보를 불러오지 못했습니다.");
  }

  return response.json() as Promise<T>;
}

async function fetchWithAuthOrNull<T>(path: string): Promise<T | null> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
    }
    if (response.status === 403) {
      throw new Error("상품 상세를 조회할 권한이 없습니다.");
    }
    throw new Error("상품 정보를 불러오지 못했습니다.");
  }

  return response.json() as Promise<T>;
}

export async function getProductRegistrationById(
  productId: number
): Promise<ProductRegistration | null> {
  if (!Number.isFinite(productId)) {
    return null;
  }

  const payload = await fetchWithAuthOrNull<ApiSuccessResponse<ProductListItemDto>>(
    `/api/products/${productId}`
  );

  if (!payload) {
    return null;
  }

  return mapProductRegistration(payload.data);
}

export async function getProductRegistrations(
  params: GetProductRegistrationsParams = {}
): Promise<GetProductRegistrationsResult> {
  const { keyword = "", page = 1, pageSize = 6, sort = "최신순" } = params;
  const searchParams = new URLSearchParams({
    mine: "true",
    isActive: "true",
    page: String(page),
    limit: String(pageSize),
    sort: PRODUCT_SORT_TO_API_SORT[sort],
  });

  if (keyword.trim()) {
    searchParams.set("keyword", keyword.trim());
  }

  const payload = await fetchWithAuth<ApiSuccessResponse<ProductListPayloadDto>>(
    `/api/products?${searchParams.toString()}`
  );
  const result = payload.data;

  return {
    items: result.data.map(mapProductRegistration),
    totalCount: result.total,
    totalPages: result.totalPages,
    page: result.page,
  };
}
