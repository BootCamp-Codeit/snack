"use client"

import * as React from "react"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export const EMAIL_ERROR_MESSAGE = "유효한 이메일이 아닙니다."
export const PASSWORD_ERROR_MESSAGE = "비밀번호는 8자 이상 입력하여야 합니다"

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(value.trim())
}

export function isValidPassword(value: string) {
  return value.length >= MIN_PASSWORD_LENGTH
}

export function useLoginFormValidation(email: string, password: string) {
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [passwordError, setPasswordError] = React.useState<string | null>(null)

  const validateEmail = React.useCallback(
    (value?: string) => {
      const v = value ?? email
      if (!v.trim()) {
        setEmailError(null)
        return true
      }
      const valid = isValidEmail(v)
      setEmailError(valid ? null : EMAIL_ERROR_MESSAGE)
      return valid
    },
    [email]
  )

  const validatePassword = React.useCallback(
    (value?: string) => {
      const v = value ?? password
      if (!v) {
        setPasswordError(null)
        return true
      }
      const valid = isValidPassword(v)
      setPasswordError(valid ? null : PASSWORD_ERROR_MESSAGE)
      return valid
    },
    [password]
  )

  return {
    emailError,
    passwordError,
    validateEmail,
    validatePassword,
  }
}
