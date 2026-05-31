"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

import { FullWidthCenterHeader } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { login } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

const W = "w-full max-w-[327px] md:max-w-[640px]"
const INPUT =
  "h-[54px] w-full rounded-[16px] text-sm md:h-[64px] md:text-[20px]"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const canSubmit =
    email.trim().length > 0 && password.trim().length > 0 && !isSubmitting

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const result = await login({
        email: email.trim(),
        password,
        invitationToken: "",
      })
      if (result.ok) {
        router.push("/productlist")
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
      <FullWidthCenterHeader className="absolute left-0 top-0 z-10" logoHref="/" />

      <div className={cn("mx-auto flex flex-col items-center gap-6", W)}>
        <h1 className="text_2xl_semibold black_black_500_t">로그인</h1>

        <form className={cn("flex flex-col gap-6", W)} noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text_lg_medium black_black_400_t">
              이메일
            </label>
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={INPUT}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text_lg_medium black_black_400_t">
              비밀번호
            </label>
            <PasswordInput
              id="password"
              placeholder="비밀번호를 입력해 주세요"
              variant="outlined"
              inputSize="md"
              className={INPUT}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleLabel="비밀번호 표시 전환"
            />
          </div>

          {submitError ? (
            <p className="text_sm_medium text-[#F97B22]" role="alert">
              {submitError}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="solid"
            size="lg"
            disabled={!canSubmit}
            className="h-[54px] w-full md:h-[64px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "로그인 중…" : "로그인"}
          </Button>
        </form>

        <p className="text-center text_xs_regular gray_gray_500_t">
          기업담당자이신가요?{" "}
          <Link
            href="/signup/super-admin"
            className="text_xs_semibold text-[#F97B22] underline underline-offset-2"
          >
            가입하기
          </Link>
        </p>
      </div>
    </main>
  )
}
