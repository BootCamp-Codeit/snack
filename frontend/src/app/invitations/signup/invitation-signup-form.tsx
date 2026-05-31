"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useLayoutEffect, useState } from "react"

import { FullWidthCenterHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { signupWithInvitation } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

const fieldWrapperClass =
  "flex min-h-[86px] w-full max-w-[327px] flex-col items-start gap-2 self-stretch md:min-h-[112px] md:max-w-[640px] md:gap-4"
const inputClass =
  "h-[54px] w-full rounded-[16px] text-sm md:h-[64px] md:text-[20px]"
const errorInputClass =
  "border-[#F97B22] focus-visible:border-[#F97B22] focus-visible:ring-0"
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/
const passwordGuideText =
  "비밀번호는 8자 이상, 대문자 1개 이상, 특수문자를 포함해야 합니다."

function decodeEmailQueryParam(raw: string): string {
  if (!raw.trim()) return ""
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}

/** 초대 JWT 등에 이메일 클레임이 있을 때만 추출 (서명 검증 없음 — 표시용) */
function tryDecodeEmailFromInvitationJwt(token: string): string | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  try {
    const payloadSegment = parts[1]
    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    )
    const json = JSON.parse(atob(padded)) as Record<string, unknown>
    const candidates = [
      json.email,
      json.inviteeEmail,
      json.invitedEmail,
      json.sub,
    ]
    for (const c of candidates) {
      if (typeof c === "string" && emailPattern.test(c.trim())) {
        return c.trim()
      }
    }
  } catch {
    return null
  }
  return null
}

export type InvitationSignupFormProps = {
  /** URL 쿼리에서 온 초대 토큰 */
  initialToken: string
  /** URL `email` 쿼리 (원문) */
  initialEmailFromQuery: string
}

export function InvitationSignupForm({
  initialToken,
  initialEmailFromQuery,
}: InvitationSignupFormProps) {
  const router = useRouter()

  const invitationToken = initialToken.trim()
  const emailFromQueryDecoded = decodeEmailQueryParam(initialEmailFromQuery)

  const [email, setEmail] = useState(() => {
    if (emailFromQueryDecoded && emailPattern.test(emailFromQueryDecoded)) {
      return emailFromQueryDecoded
    }
    return ""
  })
  const [displayName, setDisplayName] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [displayNameTouched, setDisplayNameTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [emailLockedFromInvite, setEmailLockedFromInvite] = useState(
    () =>
      Boolean(invitationToken) &&
      Boolean(emailFromQueryDecoded) &&
      emailPattern.test(emailFromQueryDecoded),
  )

  useLayoutEffect(() => {
    if (emailFromQueryDecoded && emailPattern.test(emailFromQueryDecoded)) {
      setEmail(emailFromQueryDecoded)
      setEmailLockedFromInvite(Boolean(invitationToken))
    }
  }, [emailFromQueryDecoded, invitationToken])

  useEffect(() => {
    if (!invitationToken) return
    const fromJwt = tryDecodeEmailFromInvitationJwt(invitationToken)
    if (fromJwt) {
      setEmail(fromJwt)
      setEmailLockedFromInvite(true)
    }
  }, [invitationToken])

  const normalizedEmail = email.trim()
  const isEmailValid = emailPattern.test(normalizedEmail)
  const normalizedDisplayName = displayName.trim()
  const isDisplayNameValid =
    normalizedDisplayName.length >= 1 && normalizedDisplayName.length <= 100
  const isPasswordValid = passwordPattern.test(password)

  const showEmailInvalid =
    (emailTouched || submitted) &&
    normalizedEmail.length > 0 &&
    !isEmailValid
  const showDisplayNameRequired =
    (displayNameTouched || submitted) && normalizedDisplayName.length === 0
  const showDisplayNameTooLong = normalizedDisplayName.length > 100
  const showPasswordRequired =
    (passwordTouched || submitted) && password.trim().length === 0
  const showPasswordInvalid =
    (passwordTouched || submitted) &&
    password.trim().length > 0 &&
    !isPasswordValid
  const showPasswordMismatch =
    (submitted || passwordConfirm.length > 0) &&
    passwordConfirm.trim().length > 0 &&
    password !== passwordConfirm

  const canSubmit =
    invitationToken.length > 0 &&
    isDisplayNameValid &&
    isPasswordValid &&
    passwordConfirm.trim().length > 0 &&
    password === passwordConfirm &&
    !isSubmitting &&
    (normalizedEmail.length === 0 || isEmailValid)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    if (!invitationToken) {
      setSubmitError("초대 메일의 링크를 통해 접속해 주세요.")
      return
    }

    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const result = await signupWithInvitation({
        token: invitationToken,
        password,
        displayName: normalizedDisplayName,
      })

      if (result.ok) {
        if (result.sessionStarted) {
          router.push("/productlist")
        } else {
          router.push("/login")
        }
        return
      }

      setSubmitError(result.message)
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
      <FullWidthCenterHeader
        className="absolute left-0 top-0 z-10"
        logoHref="/"
      />
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6">
        <h1 className="text_2xl_semibold black_black_500_t">초대 회원가입</h1>
        <p className="text_sm_medium gray_gray_500_t">
          초대 메일 링크에 <code className="text-xs">email</code> 쿼리가 있으면
          이메일이 자동 입력됩니다. 이름은 계정에 표시됩니다.
        </p>

        <form
          className="flex w-full flex-col items-start gap-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className={fieldWrapperClass}>
            <label htmlFor="email" className="text_lg_medium black_black_400_t">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="초대된 이메일 (자동 입력)"
              variant="outlined"
              inputSize="md"
              className={cn(
                inputClass,
                showEmailInvalid && errorInputClass,
                emailLockedFromInvite &&
                  "cursor-default bg-[#F5F5F5] text-[var(--gray-gray-500)]",
              )}
              autoComplete="email"
              inputMode="email"
              value={email}
              readOnly={emailLockedFromInvite}
              onBlur={() => setEmailTouched(true)}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={showEmailInvalid}
            />
            {normalizedEmail.length === 0 ? (
              <p className="text_xs_regular gray_gray_500_t">
                자동 입력이 없으면 백엔드에서 초대 링크에{" "}
                <code className="text-xs">?email=초대주소</code> 를 붙여 주세요.
              </p>
            ) : null}
            {showEmailInvalid && (
              <p className="text_sm_medium text-[#F97B22]">
                올바른 이메일 형식으로 입력해 주세요.
              </p>
            )}
          </div>

          <div className={fieldWrapperClass}>
            <label
              htmlFor="displayName"
              className="text_lg_medium black_black_400_t"
            >
              이름
            </label>
            <Input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="이름을 입력해 주세요 (1~100자)"
              variant="outlined"
              inputSize="md"
              className={cn(
                inputClass,
                (showDisplayNameRequired ||
                  showDisplayNameTooLong) &&
                  errorInputClass
              )}
              autoComplete="name"
              maxLength={100}
              value={displayName}
              onBlur={() => setDisplayNameTouched(true)}
              onChange={(event) => setDisplayName(event.target.value)}
              aria-invalid={showDisplayNameRequired || showDisplayNameTooLong}
              required
            />
            {showDisplayNameRequired && (
              <p className="text_sm_medium text-[#F97B22]">
                이름을 입력해 주세요.
              </p>
            )}
            {showDisplayNameTooLong && (
              <p className="text_sm_medium text-[#F97B22]">
                이름은 100자 이하여야 합니다.
              </p>
            )}
          </div>

          <div className={fieldWrapperClass}>
            <label htmlFor="password" className="text_lg_medium black_black_400_t">
              비밀번호
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="비밀번호를 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={cn(
                inputClass,
                (showPasswordRequired || showPasswordInvalid) && errorInputClass
              )}
              autoComplete="new-password"
              value={password}
              onBlur={() => setPasswordTouched(true)}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={showPasswordRequired || showPasswordInvalid}
              toggleLabel="password"
              required
            />
            <p className="text_sm_medium gray_gray_500_t">{passwordGuideText}</p>
            {showPasswordRequired && (
              <p className="text_sm_medium text-[#F97B22]">
                비밀번호를 입력해 주세요.
              </p>
            )}
            {showPasswordInvalid && (
              <p className="text_sm_medium text-[#F97B22]">{passwordGuideText}</p>
            )}
          </div>

          <div className={fieldWrapperClass}>
            <label
              htmlFor="passwordConfirm"
              className="text_lg_medium black_black_400_t"
            >
              비밀번호 확인
            </label>
            <PasswordInput
              id="passwordConfirm"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={cn(inputClass, showPasswordMismatch && errorInputClass)}
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              aria-invalid={showPasswordMismatch}
              toggleLabel="password confirmation"
              required
            />
            {showPasswordMismatch && (
              <p className="text_sm_medium text-[#F97B22]">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {submitError ? (
            <p className="text_sm_medium w-full max-w-[327px] text-[#F97B22] md:max-w-[640px]">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="solid"
            size="lg"
            disabled={!canSubmit}
            className="h-[54px] w-full max-w-[327px] disabled:cursor-not-allowed disabled:opacity-60 md:h-[64px] md:max-w-[640px]"
          >
            {isSubmitting ? "처리 중…" : "시작하기"}
          </Button>
        </form>

        <p className="w-full max-w-[327px] text-center text_xs_regular gray_gray_500_t md:max-w-[640px]">
          기업담당자로 첫 가입이신가요?{" "}
          <Link
            href="/signup/super-admin"
            className="text_xs_semibold text-[#F97B22] underline underline-offset-2"
          >
            기업담당자 회원가입
          </Link>
        </p>

        <p className="w-full max-w-[327px] text-center text_xs_regular gray_gray_500_t md:max-w-[640px]">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text_xs_semibold text-[#F97B22] underline underline-offset-2"
          >
            로그인
          </Link>
        </p>
      </section>
    </main>
  )
}
