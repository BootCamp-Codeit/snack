"use client"

import { useEffect, useState } from "react"

import {
  fetchRequesterDisplayName,
  getRequesterNameFromAccessToken,
} from "@/lib/auth/requester-display-name"

/** 장바구니 구매 요청 모달용 — 로그인 사용자 표시 이름 */
export function useRequesterDisplayName(): string {
  const [name, setName] = useState(() =>
    typeof window !== "undefined" ? getRequesterNameFromAccessToken() : "",
  )

  useEffect(() => {
    void fetchRequesterDisplayName().then(setName)
  }, [])

  return name
}
