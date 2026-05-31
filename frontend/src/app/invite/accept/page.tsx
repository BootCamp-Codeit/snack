import Link from "next/link"
import { redirect } from "next/navigation"

import { FullWidthCenterHeader } from "@/components/header"

type RawSearch = Record<string, string | string[] | undefined>

function getToken(sp: RawSearch): string {
  const t = sp.token
  const s = Array.isArray(t) ? t[0] : t
  return (s ?? "").trim()
}

function buildQuery(sp: RawSearch): string {
  const q = new URLSearchParams()
  for (const [key, raw] of Object.entries(sp)) {
    if (raw === undefined) continue
    if (Array.isArray(raw)) {
      for (const v of raw) {
        if (v !== undefined && v !== "") q.append(key, v)
      }
    } else if (raw !== "") {
      q.append(key, raw)
    }
  }
  return q.toString()
}

/**
 * 초대 메일에서 열리는 진입 URL: `/invite/accept?token=…`
 * → `/invitations/signup`으로 같은 쿼리를 넘깁니다. (서버에서 redirect)
 */
export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<RawSearch>
}) {
  const sp = await searchParams
  const token = getToken(sp)

  if (!token) {
    return (
      <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
        <FullWidthCenterHeader
          className="absolute left-0 top-0 z-10"
          logoHref="/"
        />
        <section className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6">
          <h1 className="text_2xl_semibold black_black_500_t">초대 링크</h1>
          <p className="text_sm_medium text-[#F97B22]" role="alert">
            링크에 초대 토큰이 없습니다. 메일에 있는 주소 전체를 다시
            열어 주세요.
          </p>
          <Link
            href="/login"
            className="text_sm_semibold text-[#F97B22] underline underline-offset-2"
          >
            로그인으로 이동
          </Link>
        </section>
      </main>
    )
  }

  const q = buildQuery(sp)
  redirect(q ? `/invitations/signup?${q}` : "/invitations/signup")
}
