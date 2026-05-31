"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { FullWidthCenterHeader } from "@/components/header"

/**
 * `/signup` — 레거시·북마크 호환.
 * - 초대 쿼리(`token`, `invitationToken`, `invite`, `email`)가 있으면 `/invitations/signup`으로 이어줍니다.
 * - 그 외에는 기업담당자 최초 가입(`/signup/super-admin`)으로 보냅니다.
 */
function SignupEntryRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hasInviteContext =
      searchParams.has("invitationToken") ||
      searchParams.has("token") ||
      searchParams.has("invite") ||
      searchParams.has("email")

    const q = searchParams.toString()
    if (hasInviteContext) {
      router.replace(q ? `/invitations/signup?${q}` : "/invitations/signup")
      return
    }
    router.replace("/signup/super-admin")
  }, [router, searchParams])

  return (
    <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
      <FullWidthCenterHeader
        className="absolute left-0 top-0 z-10"
        logoHref="/"
      />
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6">
        <h1 className="text_2xl_semibold black_black_500_t">회원가입</h1>
        <p className="text_sm_medium gray_gray_500_t">이동 중…</p>
      </section>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
          <FullWidthCenterHeader
            className="absolute left-0 top-0 z-10"
            logoHref="/"
          />
          <section className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6">
            <h1 className="text_2xl_semibold black_black_500_t">회원가입</h1>
            <p className="text_sm_medium gray_gray_500_t">불러오는 중…</p>
          </section>
        </main>
      }
    >
      <SignupEntryRedirect />
    </Suspense>
  )
}
