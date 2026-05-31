"use client"

import { FormEvent, useEffect, useState } from "react"

import { fetchMyOrganizationProfile } from "@/app/members/_lib/api"
import { AuthGnb } from "@/components/auth/auth-gnb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AUTH_ACCESS_TOKEN_KEY } from "@/lib/auth/constants"

const fieldWrapperClass =
    "flex min-h-[86px] w-full max-w-[327px] flex-col items-start gap-2 self-stretch md:min-h-[112px] md:max-w-[640px] md:gap-4"
const inputClass =
    "h-[54px] w-full rounded-[16px] text-sm md:h-[64px] md:text-[20px]"

const emailLooksValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

function profilePartialFromAccessToken(): {
    userName: string
    email: string
} {
    if (typeof window === "undefined") return { userName: "", email: "" }
    const token = localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)?.trim()
    if (!token) return { userName: "", email: "" }
    try {
        const part = token.split(".")[1]
        if (!part) return { userName: "", email: "" }
        const b64 = part.replace(/-/g, "+").replace(/_/g, "/")
        const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")
        const payload = JSON.parse(atob(padded)) as Record<string, unknown>
        const emailRaw = payload.email ?? payload.sub
        const email =
            typeof emailRaw === "string" && emailLooksValid(emailRaw)
                ? emailRaw.trim()
                : ""
        const userName = String(
            payload.displayName ?? payload.name ?? payload.userName ?? "",
        ).trim()
        return { userName, email }
    } catch {
        return { userName: "", email: "" }
    }
}

export default function ProfilePage() {
    const [companyName, setCompanyName] = useState("")
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [profileLoading, setProfileLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            setProfileLoading(true)
            setLoadError(null)
            try {
                const fromApi = await fetchMyOrganizationProfile()
                const fromJwt = profilePartialFromAccessToken()
                if (cancelled) return
                setCompanyName(fromApi.companyName.trim())
                setUserName(
                    fromApi.userName.trim() || fromJwt.userName,
                )
                setEmail(fromApi.email.trim() || fromJwt.email)
            } catch (e) {
                if (cancelled) return
                const fromJwt = profilePartialFromAccessToken()
                setCompanyName("")
                setUserName(fromJwt.userName)
                setEmail(fromJwt.email)
                setLoadError(
                    e instanceof Error
                        ? e.message
                        : "프로필 정보를 불러오지 못했습니다.",
                )
            } finally {
                if (!cancelled) setProfileLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    const showPasswordRequired =
        (passwordFocused || submitted) && password.trim().length === 0
    const showPasswordMismatch =
        passwordConfirm.length > 0 && password !== passwordConfirm

    const canSubmit =
        !profileLoading &&
        password.trim().length > 0 &&
        passwordConfirm.trim().length > 0 &&
        password === passwordConfirm

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitted(true)

        if (!canSubmit) return

        // TODO: 비밀번호 변경 API 연동
        window.alert("비밀번호가 변경되었습니다.")
    }

    return (
        <main className="relative min-h-screen bg-white px-6 pb-12 pt-[86px] md:pt-[96px] lg:pt-[120px]">
            <AuthGnb />
            <section className="mx-auto flex w-full max-w-[640px] flex-col items-start gap-6">
                <h1 className="text_2xl_semibold black_black_500_t">내 프로필</h1>

                {profileLoading ? (
                    <p className="text_sm_medium gray_gray_500_t">정보를 불러오는 중…</p>
                ) : null}
                {loadError ? (
                    <p className="text_sm_medium text-[#F97B22]" role="alert">
                        {loadError}
                        <span className="block text_xs_regular gray_gray_500_t mt-1">
                            일부 항목은 로그인 토큰 기준으로만 표시될 수 있습니다.
                        </span>
                    </p>
                ) : null}

                <form
                    className="flex w-full flex-col items-start gap-8"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <div className={fieldWrapperClass}>
                        <label htmlFor="companyName" className="text_lg_medium black_black_400_t">
                            기업명
                        </label>
                        <Input
                            id="companyName"
                            name="companyName"
                            type="text"
                            placeholder="—"
                            variant="outlined"
                            inputSize="md"
                            className={`${inputClass} cursor-default bg-[#F5F5F5] text-[var(--gray-gray-500)]`}
                            value={companyName}
                            readOnly
                            tabIndex={-1}
                            aria-readonly="true"
                        />
                    </div>

                    <div className={fieldWrapperClass}>
                        <label htmlFor="userName" className="text_lg_medium black_black_400_t">
                            이름
                        </label>
                        <Input
                            id="userName"
                            name="userName"
                            type="text"
                            placeholder="—"
                            variant="outlined"
                            inputSize="md"
                            className={`${inputClass} cursor-default bg-[#F5F5F5] text-[var(--gray-gray-500)]`}
                            value={userName}
                            readOnly
                            tabIndex={-1}
                            aria-readonly="true"
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
                            placeholder="—"
                            variant="outlined"
                            inputSize="md"
                            className={`${inputClass} cursor-default bg-[#F5F5F5] text-[var(--gray-gray-500)]`}
                            autoComplete="email"
                            value={email}
                            readOnly
                            tabIndex={-1}
                            aria-readonly="true"
                        />
                    </div>

                    <div className={fieldWrapperClass}>
                        <label htmlFor="password" className="text_lg_medium black_black_400_t">
                            비밀번호
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="변경할 비밀번호를 입력해 주세요"
                            variant="outlined"
                            inputSize="md"
                            className={`${inputClass} ${passwordFocused || password.trim().length > 0 || showPasswordRequired
                                ? "border-[#F97B22] focus-visible:border-[#F97B22] focus-visible:ring-0"
                                : ""
                                }`}
                            autoComplete="new-password"
                            value={password}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                        {showPasswordRequired && (
                            <p className="text_sm_medium text-[#F97B22]">비밀번호를 입력해 주세요</p>
                        )}
                    </div>

                    <div className={fieldWrapperClass}>
                        <label
                            htmlFor="passwordConfirm"
                            className="text_lg_medium black_black_400_t"
                        >
                            비밀번호 확인
                        </label>
                        <Input
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            placeholder="비밀번호를 다시 입력해 주세요"
                            variant="outlined"
                            inputSize="md"
                            className={inputClass}
                            autoComplete="new-password"
                            value={passwordConfirm}
                            onChange={(event) => setPasswordConfirm(event.target.value)}
                        />
                        {showPasswordMismatch && (
                            <p className="text_sm_medium text-[#F97B22]">
                                비밀번호가 일치하지 않습니다.
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="solid"
                        size="lg"
                        disabled={!canSubmit || profileLoading}
                        className="h-[54px] w-full max-w-[327px] disabled:cursor-not-allowed disabled:opacity-60 md:h-[64px] md:max-w-[640px]"
                    >
                        비밀번호 변경
                    </Button>
                </form>
            </section>
        </main>
    )
}
