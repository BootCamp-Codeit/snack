"use client";

import { useEffect, useState } from "react";

/**
 * 미디어 쿼리 매칭 여부를 반환합니다.
 * @param query - CSS 미디어 쿼리 (예: "(max-width: 767px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

/** 모바일 뷰포트 (768px 미만) 여부 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
