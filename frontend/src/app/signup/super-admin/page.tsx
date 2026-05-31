"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { FullWidthCenterHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { signupAdmin } from "@/lib/api/auth"
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

export default function SuperAdminSignupPage() {
  const router = useRouter()
  const [managerName, setManagerName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [businessNumber, setBusinessNumber] = useState("")
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const normalizedEmail = email.trim()
  const isEmailValid = emailPattern.test(normalizedEmail)
  const isPasswordValid = passwordPattern.test(password)

  const showEmailInvalid =
    (emailTouched || submitted) &&
    normalizedEmail.length > 0 &&
    !isEmailValid
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
    managerName.trim().length > 0 &&
    normalizedEmail.length > 0 &&
    isEmailValid &&
    isPasswordValid &&
    passwordConfirm.trim().length > 0 &&
    companyName.trim().length > 0 &&
    businessNumber.trim().length > 0 &&
    password === passwordConfirm

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    setSubmitError(null)

    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const result = await signupAdmin({
        email: normalizedEmail,
        password,
        displayName: managerName.trim(),
        organizationName: companyName.trim(),
        businessNumber: businessNumber.trim(),
      })

      if (result.ok) {
        router.push("/login")
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
        <h1 className="text_2xl_semibold black_black_500_t">
          기업담당자 회원가입
        </h1>
        <p className="text_sm_medium gray_gray_500_t">
          그룹 내 일반 회원·관리자는 초대 메일의 링크(
          <span className="whitespace-nowrap">/invite/accept?token=…</span>)를
          통해 가입할 수 있습니다.
        </p>

        <form
          className="flex w-full flex-col items-start gap-8"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className={fieldWrapperClass}>
            <label
              htmlFor="managerName"
              className="text_lg_medium black_black_400_t"
            >
              이름(기업 담당자)
            </label>
            <Input
              id="managerName"
              name="managerName"
              type="text"
              placeholder="이름을 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={inputClass}
              value={managerName}
              onChange={(event) => setManagerName(event.target.value)}
              required
            />
          </div>

          <div className={fieldWrapperClass}>
            <label htmlFor="email" className="text_lg_medium black_black_400_t">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={cn(inputClass, showEmailInvalid && errorInputClass)}
              autoComplete="email"
              inputMode="email"
              value={email}
              onBlur={() => setEmailTouched(true)}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={showEmailInvalid}
              required
            />
            {showEmailInvalid && (
              <p className="text_sm_medium text-[#F97B22]">
                올바른 이메일 형식으로 입력해 주세요.
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

          <div className={fieldWrapperClass}>
            <label
              htmlFor="companyName"
              className="text_lg_medium black_black_400_t"
            >
              회사명
            </label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="회사명을 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={inputClass}
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </div>

          <div className={fieldWrapperClass}>
            <label
              htmlFor="businessNumber"
              className="text_lg_medium black_black_400_t"
            >
              사업자번호
            </label>
            <Input
              id="businessNumber"
              name="businessNumber"
              type="text"
              placeholder="사업자번호를 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={inputClass}
              value={businessNumber}
              onChange={(event) => setBusinessNumber(event.target.value)}
              required
            />
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
            disabled={!canSubmit || isSubmitting}
            className="h-[54px] w-full max-w-[327px] disabled:cursor-not-allowed disabled:opacity-60 md:h-[64px] md:max-w-[640px]"
          >
            {isSubmitting ? "처리 중…" : "시작하기"}
          </Button>
        </form>

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
