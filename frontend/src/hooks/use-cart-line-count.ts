"use client"

import { useCallback, useEffect, useState } from "react"

import { buildCartAuthHeaders } from "@/lib/cart/auth-headers"
import { CART_LINE_COUNT_UPDATED_EVENT } from "@/lib/cart/events"
import { pickCartItemList } from "@/lib/cart/payload"

const CART_COUNT_CACHE_TTL_MS = 5000
let cartCountCachedValue = 0
let cartCountCachedAt = 0
let cartCountInFlight: Promise<number> | null = null

async function fetchCartLineCountShared(force = false): Promise<number> {
  if (typeof window === "undefined") return 0
  const now = Date.now()
  if (!force && now - cartCountCachedAt < CART_COUNT_CACHE_TTL_MS) {
    return cartCountCachedValue
  }
  if (!force && cartCountInFlight) return cartCountInFlight

  const auth = buildCartAuthHeaders()
  if (!auth.Authorization) {
    cartCountCachedValue = 0
    cartCountCachedAt = now
    return 0
  }

  const task = fetch("/api/cart", {
    credentials: "include",
    headers: auth,
  })
    .then(async (res) => {
      if (!res.ok) return 0
      const data: unknown = await res.json()
      return pickCartItemList(data).length
    })
    .catch(() => 0)
    .then((count) => {
      cartCountCachedValue = count
      cartCountCachedAt = Date.now()
      return count
    })
    .finally(() => {
      cartCountInFlight = null
    })

  cartCountInFlight = task
  return task
}

/**
 * 장바구니 **품목(줄) 개수** — 총 수량 합이 아님.
 */
export function useCartLineCount(): number {
  const [count, setCount] = useState(0)

  const refresh = useCallback(async (force = false) => {
    const next = await fetchCartLineCountShared(force)
    setCount(next)
  }, [])

  useEffect(() => {
    void refresh()
    const onUpdate = () => void refresh(true)
    window.addEventListener(CART_LINE_COUNT_UPDATED_EVENT, onUpdate)
    window.addEventListener("focus", onUpdate)
    return () => {
      window.removeEventListener(CART_LINE_COUNT_UPDATED_EVENT, onUpdate)
      window.removeEventListener("focus", onUpdate)
    }
  }, [refresh])

  return count
}
