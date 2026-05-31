import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_MEMBERSHIP_ROLE_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants";

/** 액세스·리프레시 토큰 및 캐시된 멤버십 역할 제거 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_MEMBERSHIP_ROLE_KEY);
  window.dispatchEvent(new Event("snack-auth-changed"));
}
