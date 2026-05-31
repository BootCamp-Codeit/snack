"use client"

import { HeaderWithCart } from "@/components/header/header-with-cart"
import { useAuthHeader } from "@/hooks/use-auth-header"
import { useDevice } from "@/hooks/use-device"

export function ProductListGlobalHeader() {
  const device = useDevice()
  const { isLoggedIn, role } = useAuthHeader()

  return <HeaderWithCart device={device} isLoggedIn={isLoggedIn} role={role} />
}

