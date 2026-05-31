import { fetchMyOrganizationProfile } from "@/app/members/_lib/api"

import { readAccessTokenFromStorage } from "./ensure-access-token"

/**
 * 액세스 토큰 페이로드에서 표시용 이름 후보 추출 (프로필 API 실패 시 폴백)
 */
export function getRequesterNameFromAccessToken(): string {
  if (typeof window === "undefined") return ""
  const token = readAccessTokenFromStorage()
  if (!token) return ""
  try {
    const part = token.split(".")[1]
    if (!part) return ""
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>
    return String(
      payload.displayName ??
        payload.name ??
        payload.userName ??
        payload.nickname ??
        "",
    ).trim()
  } catch {
    return ""
  }
}

/**
 * 구매 요청 모달 등에 쓸 요청인 표시 이름 — `GET /api/auth/me` 우선, 없으면 JWT, 둘 다 없으면 "회원".
 */
export async function fetchRequesterDisplayName(): Promise<string> {
  try {
    const p = await fetchMyOrganizationProfile()
    const n = p.userName.trim()
    if (n) return n
  } catch {
    // ignore
  }
  const fromJwt = getRequesterNameFromAccessToken()
  return fromJwt || "회원"
}
