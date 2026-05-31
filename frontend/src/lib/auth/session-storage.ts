import type { HeaderRole } from "@/components/header";

import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_MEMBERSHIP_ROLE_KEY,
} from "@/lib/auth/constants";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const json: unknown = JSON.parse(atob(padded));
    return typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function roleFromAccessToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  return typeof role === "string" ? role : null;
}

/** API `membership.role` / JWT `role` → 헤더용 역할 */
export function mapApiMembershipRoleToHeaderRole(
  apiRole: string | undefined | null
): HeaderRole {
  const normalized = (apiRole ?? "")
    .toUpperCase()
    .replace(/-/g, "_")
    .trim();
  if (normalized === "SUPER_ADMIN") return "superAdmin";
  if (normalized === "ADMIN") return "admin";
  return "member";
}

/**
 * 로그인 성공 직후: 응답 본문의 membership.role 저장.
 * 없으면 accessToken JWT 페이로드의 role로 보완.
 */
export function persistMembershipRoleFromLoginData(
  data: Record<string, unknown>,
  accessToken: string
): void {
  if (typeof window === "undefined") return;

  let apiRole: string | undefined;
  const membership = data.membership;
  if (membership && typeof membership === "object") {
    const role = (membership as Record<string, unknown>).role;
    if (typeof role === "string" && role.length > 0) apiRole = role;
  }
  if (!apiRole) {
    apiRole = roleFromAccessToken(accessToken) ?? undefined;
  }
  if (apiRole) {
    localStorage.setItem(AUTH_MEMBERSHIP_ROLE_KEY, apiRole);
  }
}

export function getStoredHeaderRole(): HeaderRole {
  if (typeof window === "undefined") return "member";

  const cached = localStorage.getItem(AUTH_MEMBERSHIP_ROLE_KEY);
  if (cached) return mapApiMembershipRoleToHeaderRole(cached);

  const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
  if (token) {
    const fromJwt = roleFromAccessToken(token);
    if (fromJwt) return mapApiMembershipRoleToHeaderRole(fromJwt);
  }

  return "member";
}

export function hasStoredAccessToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)?.trim());
}
