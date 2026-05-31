// src/components/ui/molecules/login-form/login-form.tsx
"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { useLoginFormValidation } from "@/hooks/login-form-validation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const VISIBILITY_OFF_SRC = "/assets/icons/visibility_off.svg"
const VISIBILITY_ON_SRC = "/assets/icons/visibility_on.svg"

type LoginFormSize = "md" | "sm"

export const LoginForm = ({
  className,
  size = "md",
  onSubmit: onSubmitProp,
  ...props
}: React.ComponentProps<"form"> & { size?: LoginFormSize }) => {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [emailFocused, setEmailFocused] = React.useState(false)
  const [passwordFocused, setPasswordFocused] = React.useState(false)
  const isDisabled = !email.trim() || !password.trim()

  const {
    emailError,
    passwordError,
    validateEmail,
    validatePassword,
  } = useLoginFormValidation(email, password)

  const isSm = size === "sm"
  const inputSizeClass = isSm ? "h-[54px] w-full text-sm" : "h-[64px] w-full text-base"
  const activeInputClass =
    "border-2 border-[#F97B22] rounded-[16px] focus:border-[#F97B22] focus-visible:border-[#F97B22]"
  const errorMessageClass = "mt-1 text-sm text-[#F63B20]"

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const emailValid = validateEmail(email)
    const passwordValid = validatePassword(password)
    if (emailValid && passwordValid && onSubmitProp) {
      onSubmitProp(e)
    }
  }

  return (
    <>
      <form
        className={cn("flex flex-col gap-4 w-full items-center", className)}
        {...props}
        onSubmit={handleSubmit}
      >
        <label htmlFor="email" className="w-full text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          placeholder="이메일을 입력해주세요."
          value={email}
          onChange={(e) => {
            const next = e.target.value
            setEmail(next)
            if (emailError) validateEmail(next)
          }}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => {
            setEmailFocused(false)
            validateEmail()
          }}
          className={cn(inputSizeClass, (email.trim() || emailFocused) && activeInputClass)}
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <p id="email-error" className={cn("w-full", errorMessageClass)} role="alert">
            {emailError}
          </p>
        )}
        <label htmlFor="password" className="w-full text-sm font-medium">
          비밀번호
        </label>
        <div className="relative w-full">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력해주세요."
            value={password}
            onChange={(e) => {
              const next = e.target.value
              setPassword(next)
              if (passwordError) validatePassword(next)
            }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => {
              setPasswordFocused(false)
              validatePassword()
            }}
            className={cn(inputSizeClass, "pr-10", (password.trim() || passwordFocused) && activeInputClass)}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className={cn(
              "absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSm ? "size-5" : "size-6"
            )}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
          >
            <Image
              src={showPassword ? VISIBILITY_ON_SRC : VISIBILITY_OFF_SRC}
              alt=""
              width={isSm ? 20 : 24}
              height={isSm ? 20 : 24}
              className={cn(isSm ? "size-5" : "size-6")}
              aria-hidden
            />
          </button>
        </div>
        {passwordError && (
          <p id="password-error" className={cn("w-full", errorMessageClass)} role="alert">
            {passwordError}
          </p>
        )}
        <Button
          type="submit"
          size={isSm ? "sm" : "lg"}
          disabled={isDisabled}
          className={cn(
            "mt-4 w-full",
            isSm ? "h-[54px]" : "h-[64px]",
            isDisabled && "bg-[#E0E0E0] text-white cursor-not-allowed hover:bg-[#E0E0E0]"
          )}
        >
          로그인
        </Button>
      </form>

    </>
  )
}