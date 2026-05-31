import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants"

function normalizeStoredToken(raw: string | null): string | null {
  if (raw == null) return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

/** `snack_access_token` 우선, 구버전/다른 키 폴백 */
export function readAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return normalizeStoredToken(
    localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token") ??
      localStorage.getItem("authToken"),
  )
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1]
    if (!payloadPart) return null
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

function isAccessTokenExpiredOrExpiringSoon(
  token: string,
  skewSeconds = 60,
): boolean {
  const payload = decodeJwtPayload(token)
  const expRaw = payload?.exp
  if (expRaw === undefined || expRaw === null) return false
  const exp = Number(expRaw)
  if (!Number.isFinite(exp)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec + skewSeconds
}

function persistTokensFromRefresh(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
}

function extractTokensFromRefreshPayload(data: Record<string, unknown>): {
  accessToken: string
  refreshToken: string
} | null {
  const fromObject = (t: Record<string, unknown> | undefined) => {
    if (!t) return null
    const access =
      (typeof t.accessToken === "string" && t.accessToken) ||
      (typeof t.access_token === "string" && t.access_token) ||
      null
    const refresh =
      (typeof t.refreshToken === "string" && t.refreshToken) ||
      (typeof t.refresh_token === "string" && t.refresh_token) ||
      null
    if (access && refresh) return { accessToken: access, refreshToken: refresh }
    return null
  }
  const nested = fromObject(data.tokens as Record<string, unknown> | undefined)
  if (nested) return nested
  return fromObject(data)
}

/** 401 응답 후 한 번 더 갱신 시도할 때 사용 */
export async function refreshAuthTokensOnce(): Promise<boolean> {
  return tryRefreshAuthTokens()
}

async function tryRefreshAuthTokens(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)?.trim()
  if (!refreshToken) return false

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    return false
  }

  if (!res.ok || !body || typeof body !== "object") return false
  const o = body as Record<string, unknown>
  if (o.success !== true || !o.data || typeof o.data !== "object") return false
  const pair = extractTokensFromRefreshPayload(o.data as Record<string, unknown>)
  if (!pair) return false
  persistTokensFromRefresh(pair.accessToken, pair.refreshToken)
  return true
}

/**
 * API 호출 직전에 호출: 액세스 토큰이 곧 만료/만료였으면 refresh 후 저장.
 * 성공 시 true (또는 갱신 불필요), 실패 시 false.
 */
export async function ensureAccessTokenFresh(): Promise<boolean> {
  const access = readAccessTokenFromStorage()
  if (!access) return false

  if (!isAccessTokenExpiredOrExpiringSoon(access)) {
    return true
  }

  return tryRefreshAuthTokens()
}
