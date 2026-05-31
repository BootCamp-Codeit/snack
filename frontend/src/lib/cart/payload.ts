/**
 * 장바구니 API 응답에서 줄 배열 추출 (백엔드 스키마 차이 대응)
 */
export function pickCartItemList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return []
  const p = payload as Record<string, unknown>
  const data =
    p.data !== undefined && p.data !== null && typeof p.data === "object" && !Array.isArray(p.data)
      ? (p.data as Record<string, unknown>)
      : p
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.cartItems)) return data.cartItems
  if (Array.isArray(data.lines)) return data.lines
  return []
}

export function extractProductIdFromCartRow(row: Record<string, unknown>): number | null {
  const direct = row.productId
  if (direct !== undefined && direct !== null) {
    const n = Number(direct)
    if (Number.isFinite(n) && n > 0) return n
  }
  const prod = row.product
  if (prod && typeof prod === "object" && !Array.isArray(prod)) {
    const n = Number((prod as Record<string, unknown>).id)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

/** 같은 상품이 이미 담겼으면 해당 장바구니 줄 id */
export function findCartLineIdForProduct(
  rows: unknown[],
  productId: number,
): string | null {
  for (const item of rows) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue
    const row = item as Record<string, unknown>
    const pid = extractProductIdFromCartRow(row)
    if (pid !== productId) continue
    const lineId = String(row.id ?? row.cartItemId ?? row.lineId ?? "").trim()
    if (lineId) return lineId
  }
  return null
}

/** 줄 수량 — `product.quantity`는 재고 등으로 쓰이는 경우가 있어 줄 전용 필드만 사용 */
export function parseLineQuantity(row: Record<string, unknown>): number {
  const raw =
    row.quantity ??
    row.qty ??
    row.count ??
    row.lineQuantity ??
    row.itemQuantity ??
    row.itemQty
  const n = Number(raw)
  if (Number.isFinite(n) && n >= 1) return Math.min(99, Math.floor(n))
  return 1
}
