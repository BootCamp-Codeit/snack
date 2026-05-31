import { readAccessTokenFromStorage } from "@/lib/auth/ensure-access-token"

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

/** 장바구니 API용 Authorization + 선택적 X-Organization-Id */
export function buildCartAuthHeaders(): Record<string, string> {
  const token =
    typeof window === "undefined" ? "" : (readAccessTokenFromStorage() ?? "").trim()
  const h: Record<string, string> = {}
  if (!token) return h
  h.Authorization = `Bearer ${token}`
  const payload = decodeJwtPayload(token)
  const org =
    payload?.organizationId ??
    payload?.organization_id ??
    payload?.orgId ??
    payload?.org_id
  if (org !== undefined && org !== null && String(org).trim()) {
    h["X-Organization-Id"] = String(org).trim()
  }
  return h
}
