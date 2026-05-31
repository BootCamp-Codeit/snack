"use client";

import type { HeaderRole } from "@/components/header";
import { getStoredHeaderRole, hasStoredAccessToken } from "@/lib/auth/session-storage";
import { useEffect, useState } from "react";

/**
 * localStorage의 액세스 토큰·로그인 시 저장한 `membership.role` 기준으로
 * 헤더용 로그인 여부·역할을 반환합니다. (초기 렌더는 SSR과 맞추기 위해 비로그인으로 두고, 마운트 후 동기화)
 */
export function useAuthHeader(): { isLoggedIn: boolean; role: HeaderRole } {
  const [state, setState] = useState<{
    isLoggedIn: boolean;
    role: HeaderRole;
  }>(() => ({
    isLoggedIn: false,
    role: "member",
  }));

  useEffect(() => {
    const sync = () => {
      setState({
        isLoggedIn: hasStoredAccessToken(),
        role: getStoredHeaderRole(),
      });
    };
    sync();
    window.addEventListener("snack-auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("snack-auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
