"use client"

import { Header, type HeaderProps } from "@/components/header"
import { useCartLineCount } from "@/hooks/use-cart-line-count"

type Props = Omit<HeaderProps, "cartCount">

/** 로그인 헤더 — 장바구니 품목(줄) 수 배지 */
export function HeaderWithCart(props: Props) {
  const cartLineCount = useCartLineCount()
  return <Header {...props} cartCount={cartLineCount} />
}
