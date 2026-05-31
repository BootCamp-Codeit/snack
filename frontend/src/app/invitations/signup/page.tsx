import { InvitationSignupForm } from "./invitation-signup-form"

function firstString(
  value: string | string[] | undefined
): string {
  if (value === undefined) return ""
  return Array.isArray(value) ? (value[0] ?? "") : value
}

/**
 * 서버에서 쿼리스트링을 읽어 클라이언트에 넘깁니다.
 * `useSearchParams()`만 쓰면 초기 HTML에 `searchParams: {}` 로 나가
 * «불러오는 중…» 만 보이는 문제가 생길 수 있습니다.
 */
export default async function InvitationSignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const token =
    firstString(sp.invitationToken) ||
    firstString(sp.token) ||
    firstString(sp.invite)
  const emailRaw = firstString(sp.email)

  return (
    <InvitationSignupForm
      initialToken={token.trim()}
      initialEmailFromQuery={emailRaw}
    />
  )
}
