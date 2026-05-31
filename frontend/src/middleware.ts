import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const INVITE_ACCEPT_PATHS = new Set([
  "/invite/accept",
  "/invitations/accept",
  "/invitation/accept",
])

/**
 * 초대 메일 링크가 클라이언트 Suspense(`useSearchParams`)에서 멈추지 않도록,
 * 토큰이 있으면 Edge에서 바로 가입 페이지로 보냅니다.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!INVITE_ACCEPT_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const token = request.nextUrl.searchParams.get("token")?.trim() ?? ""
  if (!token) {
    return NextResponse.next()
  }

  const dest = request.nextUrl.clone()
  dest.pathname = "/invitations/signup"
  return NextResponse.redirect(dest)
}

export const config = {
  matcher: [
    "/invite/accept",
    "/invitations/accept",
    "/invitation/accept",
  ],
}
