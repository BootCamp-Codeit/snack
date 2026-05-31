import { AUTH_ACCESS_TOKEN_KEY } from "@/lib/auth/constants"
import { notifyCartLineCountChanged } from "@/lib/cart/events"
import { findCartLineIdForProduct, pickCartItemList } from "@/lib/cart/payload"
import { API_BASE_URL } from "@/lib/env"
import type {
  CatalogCategory,
  CreateCategoryInput,
  CreateProductInput,
  GetProductsParams,
  GetProductsResult,
  Product,
  SortOption,
  UpdateCategoryInput,
  UpdateProductInput,
} from "./types"

const REQUEST_TIMEOUT_MS = 15000

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * GET /api/products 는 `sort` 쿼리를 지원하지 않습니다.
 * `sortProductsClient`는 **현재 페이지에 내려온 항목만** 정렬합니다(페이지 경계를 넘는 정렬은 불가).
 */

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null

  return (
    localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken")
  )
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1]
    if (!part) return null
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

function resolveOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const raw =
    payload?.organizationId ??
    payload?.organization_id ??
    payload?.orgId ??
    payload?.org_id
  if (raw === undefined || raw === null) return null
  const value = String(raw).trim()
  return value.length > 0 ? value : null
}

function parseErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string") {
    const trimmed = payload.trim()
    return trimmed ? trimmed : fallback
  }

  if (!payload || typeof payload !== "object") return fallback

  const data =
    "data" in (payload as Record<string, unknown>) &&
    (payload as { data?: unknown }).data &&
    typeof (payload as { data?: unknown }).data === "object"
      ? ((payload as { data?: unknown }).data as Record<string, unknown>)
      : null

  const candidates = [
    (payload as { message?: unknown }).message,
    (payload as { error?: unknown }).error,
    (payload as { detail?: unknown }).detail,
    data?.message,
    data?.error,
    data?.detail,
  ]

  const text = candidates.find((value) => typeof value === "string")
  return text ?? fallback
}

function getDataPayload(payload: unknown) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data ?? null
  }
  return payload
}

function pickNumber(values: unknown[], fallback: number) {
  const found = values.find((value) => Number.isFinite(Number(value)))
  return found !== undefined ? Number(found) : fallback
}

function resolveImageUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return ""

  const trimmed = raw.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL.replace(/\/$/, "")}${trimmed}`
  }

  return trimmed
}

export function mapApiRecordToProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null

  const r = raw as Record<string, unknown>
  const id = Number(r.id ?? r.productId ?? 0)
  if (!Number.isFinite(id) || id <= 0) return null

  const name = String(r.name ?? r.productName ?? r.title ?? "").trim()
  const priceRaw = r.price ?? r.unitPrice ?? 0
  const price =
    typeof priceRaw === "string" ? Number.parseFloat(priceRaw) : Number(priceRaw)

  const purchaseCount = Number(
    r.purchaseCountCache ??
      r.purchaseCount ??
      r.orderCount ??
      r.totalPurchases ??
      r.soldCount ??
      0,
  )

  let category = ""
  const cat = r.category
  if (cat && typeof cat === "object" && !Array.isArray(cat)) {
    category = String((cat as Record<string, unknown>).name ?? "").trim()
  } else {
    category = String(
      r.category ?? r.categoryName ?? r.subCategoryName ?? r.categoryLabel ?? "",
    ).trim()
  }

  const image = resolveImageUrl(
    r.image ?? r.imageUrl ?? r.imageKey ?? r.thumbnailUrl ?? r.thumbnail,
  )

  const categoryId =
    r.categoryId === null || r.categoryId === undefined
      ? null
      : Number(r.categoryId)

  return {
    id,
    name: name || `상품 #${id}`,
    price: Number.isFinite(price) ? price : 0,
    purchaseCount: Number.isFinite(purchaseCount) ? purchaseCount : 0,
    category,
    image,
    categoryId: Number.isFinite(categoryId) ? categoryId : null,
    productUrl:
      r.productUrl === null || r.productUrl === undefined
        ? null
        : String(r.productUrl),
    imageKey:
      r.imageKey === null || r.imageKey === undefined
        ? null
        : String(r.imageKey),
  }
}

function extractProductsArray(payload: unknown): unknown[] {
  const source = getDataPayload(payload)

  if (Array.isArray(source)) return source

  if (source && typeof source === "object") {
    const raw = source as Record<string, unknown>
    if (Array.isArray(raw.products)) return raw.products
    if (Array.isArray(raw.items)) return raw.items
    if (Array.isArray(raw.list)) return raw.list
    if (Array.isArray(raw.content)) return raw.content
    if (Array.isArray(raw.data)) return raw.data

    if (raw.data && typeof raw.data === "object") {
      const nested = raw.data as Record<string, unknown>
      if (Array.isArray(nested.products)) return nested.products
      if (Array.isArray(nested.items)) return nested.items
      if (Array.isArray(nested.list)) return nested.list
      if (Array.isArray(nested.content)) return nested.content
    }
  }

  return []
}

async function apiFetch(path: string, init?: RequestInit): Promise<{
  response: Response
  json: unknown
}> {
  const token = getAccessToken()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const hasBody = init?.body !== undefined

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
    })
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")
    }
    throw new Error("네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.")
  } finally {
    clearTimeout(timeout)
  }

  const text = await response.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text) as unknown
    } catch {
      json = text
    }
  }

  return { response, json }
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { response, json } = await apiFetch(path, init)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      parseErrorMessage(json, "요청 처리에 실패했습니다."),
    )
  }

  return json as T
}

function parseCatalogCategoryRow(row: unknown): CatalogCategory | null {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null
  const o = row as Record<string, unknown>
  const id = Number(o.id)
  if (!Number.isFinite(id)) return null
  const parentRaw = o.parentId
  const parentId =
    parentRaw === null || parentRaw === undefined
      ? null
      : Number(parentRaw)
  return {
    id,
    name: String(o.name ?? ""),
    parentId:
      parentId !== null && Number.isFinite(parentId) ? parentId : null,
    sortOrder: Number.isFinite(Number(o.sortOrder))
      ? Number(o.sortOrder)
      : undefined,
    isActive: typeof o.isActive === "boolean" ? o.isActive : undefined,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
  }
}

function sortProductsClient(products: Product[], sort: SortOption) {
  const copied = [...products]
  switch (sort) {
    case "latest":
      return copied.sort((a, b) => b.id - a.id)
    case "priceAsc":
      return copied.sort((a, b) => a.price - b.price)
    case "priceDesc":
      return copied.sort((a, b) => b.price - a.price)
    case "purchaseDesc":
      return copied.sort((a, b) => b.purchaseCount - a.purchaseCount)
    default:
      return copied
  }
}

export async function getCategories(): Promise<CatalogCategory[]> {
  const payload = await requestApi<unknown>("/api/categories")
  const data = getDataPayload(payload)
  if (!Array.isArray(data)) return []
  return data
    .map((row) => parseCatalogCategoryRow(row))
    .filter((c): c is CatalogCategory => c !== null)
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<CatalogCategory> {
  const name = input.name.trim()
  if (!name) {
    throw new Error("카테고리 이름을 입력해주세요.")
  }

  const body: Record<string, unknown> = { name }
  if (input.parentId != null && Number.isFinite(input.parentId)) {
    body.parentId = input.parentId
  }
  if (
    input.sortOrder != null &&
    Number.isFinite(input.sortOrder) &&
    input.sortOrder >= 0
  ) {
    body.sortOrder = Math.floor(input.sortOrder)
  }
  if (typeof input.isActive === "boolean") {
    body.isActive = input.isActive
  }

  const payload = await requestApi<unknown>("/api/categories", {
    method: "POST",
    body: JSON.stringify(body),
  })
  const data = getDataPayload(payload)
  const record =
    data && typeof data === "object" && !Array.isArray(data) ? data : payload
  const cat = parseCatalogCategoryRow(record)
  if (!cat) {
    throw new Error("카테고리 응답을 해석할 수 없습니다.")
  }
  return cat
}

export async function updateCategory(
  categoryId: number,
  input: UpdateCategoryInput,
): Promise<CatalogCategory> {
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new Error("유효하지 않은 카테고리입니다.")
  }

  const body: Record<string, unknown> = {}
  if (input.name !== undefined) {
    body.name = input.name.trim()
  }
  if (input.parentId !== undefined) {
    body.parentId = input.parentId
  }
  if (
    input.sortOrder !== undefined &&
    Number.isFinite(input.sortOrder) &&
    input.sortOrder >= 0
  ) {
    body.sortOrder = Math.floor(input.sortOrder)
  }
  if (typeof input.isActive === "boolean") {
    body.isActive = input.isActive
  }

  if (Object.keys(body).length === 0) {
    throw new Error("변경할 내용이 없습니다.")
  }

  const payload = await requestApi<unknown>(`/api/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  })
  const data = getDataPayload(payload)
  const record =
    data && typeof data === "object" && !Array.isArray(data) ? data : payload
  const cat = parseCatalogCategoryRow(record)
  if (!cat) {
    throw new Error("카테고리 응답을 해석할 수 없습니다.")
  }
  return cat
}

export async function deleteCategory(categoryId: number): Promise<void> {
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new Error("유효하지 않은 카테고리입니다.")
  }
  const { response, json } = await apiFetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      parseErrorMessage(json, "삭제에 실패했습니다."),
    )
  }
}

export async function getProducts(
  params: GetProductsParams = {},
): Promise<GetProductsResult> {
  const {
    keyword = "",
    categoryId: filterCategoryId,
    sort = "latest",
    page = 1,
    pageSize = 12,
  } = params

  const query = new URLSearchParams()
  const kw = keyword.trim()
  if (kw) query.set("keyword", kw)
  query.set("page", String(page))
  query.set("limit", String(pageSize))
  query.set("isActive", "true")
  if (filterCategoryId != null && Number.isFinite(filterCategoryId)) {
    query.set("categoryId", String(filterCategoryId))
  }

  const qs = query.toString()
  const payload = await requestApi<unknown>(`/api/products?${qs}`)

  const rawItems = extractProductsArray(payload)
  let products = rawItems
    .map(mapApiRecordToProduct)
    .filter((p): p is Product => p !== null)

  products = sortProductsClient(products, sort)

  const dataPayload = getDataPayload(payload)
  const meta =
    dataPayload && typeof dataPayload === "object" && !Array.isArray(dataPayload)
      ? (dataPayload as Record<string, unknown>)
      : {}

  const rootPayload = payload as Record<string, unknown>

  const totalCount = pickNumber(
    [
      meta.totalCount,
      meta.total,
      meta.totalElements,
      rootPayload.totalCount,
      products.length,
    ],
    products.length,
  )

  const totalPages = pickNumber(
    [meta.totalPages, meta.pageCount, rootPayload.totalPages],
    Math.max(1, Math.ceil(totalCount / pageSize)),
  )

  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages))
  return {
    products,
    totalCount,
    totalPages: Math.max(1, totalPages),
    page: currentPage,
  }
}

export async function getProductById(productId: number): Promise<Product | null> {
  if (!Number.isFinite(productId) || productId <= 0) return null

  const { response, json: payload } = await apiFetch(`/api/products/${productId}`)

  if (response.status === 404) return null
  if (!response.ok) {
    throw new ApiError(
      response.status,
      parseErrorMessage(payload, "요청 처리에 실패했습니다."),
    )
  }

  const data = getDataPayload(payload)
  const record =
    data && typeof data === "object" && !Array.isArray(data)
      ? data
      : payload && typeof payload === "object" && !Array.isArray(payload)
        ? payload
        : null
  return mapApiRecordToProduct(record)
}

export async function getProductCategories(): Promise<string[]> {
  const rows = await getCategories()
  const names = rows.map((r) => r.name.trim()).filter(Boolean)
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "ko"))
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const body: Record<string, unknown> = {
    name: input.name,
    price: input.price,
    isActive: input.isActive ?? true,
  }
  if (input.categoryId !== undefined && input.categoryId !== null) {
    body.categoryId = input.categoryId
  } else {
    body.categoryId = null
  }
  if (input.imageKey !== undefined && input.imageKey !== null && input.imageKey !== "") {
    body.imageKey = input.imageKey
  } else {
    body.imageKey = null
  }
  if (input.productUrl !== undefined && input.productUrl !== null && input.productUrl !== "") {
    body.productUrl = input.productUrl
  } else {
    body.productUrl = null
  }

  const payload = await requestApi<unknown>("/api/products", {
    method: "POST",
    body: JSON.stringify(body),
  })
  const data = getDataPayload(payload)
  const record =
    data && typeof data === "object" && !Array.isArray(data) ? data : payload
  const p = mapApiRecordToProduct(record)
  if (!p) throw new Error("상품 응답을 해석할 수 없습니다.")
  return p
}

export async function updateProduct(
  productId: number,
  input: UpdateProductInput,
): Promise<Product> {
  if (!Number.isFinite(productId) || productId <= 0) {
    throw new Error("유효하지 않은 상품입니다.")
  }
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.price !== undefined) patch.price = input.price
  if (input.categoryId !== undefined) patch.categoryId = input.categoryId
  if (input.imageKey !== undefined) patch.imageKey = input.imageKey
  if (input.productUrl !== undefined) patch.productUrl = input.productUrl
  if (input.isActive !== undefined) patch.isActive = input.isActive

  const payload = await requestApi<unknown>(`/api/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
  const data = getDataPayload(payload)
  const record =
    data && typeof data === "object" && !Array.isArray(data) ? data : payload
  const p = mapApiRecordToProduct(record)
  if (!p) throw new Error("상품 응답을 해석할 수 없습니다.")
  return p
}

export async function deleteProduct(productId: number): Promise<void> {
  if (!Number.isFinite(productId) || productId <= 0) {
    throw new Error("유효하지 않은 상품입니다.")
  }
  await requestApi<unknown>(`/api/products/${productId}`, {
    method: "DELETE",
  })
}

/**
 * 장바구니 담기 — 상세에서 고른 수량이 그대로 반영되도록,
 * 이미 같은 상품이 담겨 있으면 `PATCH`로 수량을 **덮어쓰고**, 없으면 `POST`로 추가.
 * (백엔드가 POST 시 누적만 하면 1개 추가가 기존 4개에 더해져 5로 보이는 문제를 막음)
 */
export async function addCartItem(productId: number, quantity: number): Promise<void> {
  if (!Number.isFinite(productId) || productId <= 0) {
    throw new Error("유효하지 않은 상품입니다.")
  }
  const qty = Math.min(99, Math.max(1, Math.floor(quantity)))
  const token = getAccessToken()?.trim()
  if (!token) {
    throw new Error("로그인이 필요합니다.")
  }
  const orgId = resolveOrganizationIdFromToken(token)

  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(orgId ? { "X-Organization-Id": orgId } : {}),
  }

  const jsonHeaders: Record<string, string> = {
    ...authHeaders,
    "Content-Type": "application/json",
  }

  try {
    const getRes = await fetch("/api/cart", {
      credentials: "include",
      headers: authHeaders,
    })
    if (getRes.ok) {
      const data: unknown = await getRes.json()
      const rows = pickCartItemList(data)
      const lineId = findCartLineIdForProduct(rows, productId)
      if (lineId) {
        const patchRes = await fetch(`/api/cart/items/${encodeURIComponent(lineId)}`, {
          method: "PATCH",
          credentials: "include",
          headers: jsonHeaders,
          body: JSON.stringify({ quantity: qty }),
        })
        const text = await patchRes.text()
        let json: unknown = null
        if (text) {
          try {
            json = JSON.parse(text) as unknown
          } catch {
            json = text
          }
        }
        if (!patchRes.ok) {
          throw new ApiError(
            patchRes.status,
            parseErrorMessage(json, "요청 처리에 실패했습니다."),
          )
        }
        notifyCartLineCountChanged()
        return
      }
    }
  } catch (e) {
    if (e instanceof ApiError) throw e
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch("/api/cart/items", {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      headers: jsonHeaders,
      body: JSON.stringify({ productId, quantity: qty }),
    })
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.")
    }
    throw new Error("네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.")
  } finally {
    clearTimeout(timeout)
  }

  const text = await response.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text) as unknown
    } catch {
      json = text
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      parseErrorMessage(json, "요청 처리에 실패했습니다."),
    )
  }
  notifyCartLineCountChanged()
}
