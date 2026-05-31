// src/app/budget-mng/_components/budget-form.tsx

"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Image from "next/image"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  getBudgetPeriod,
  getMonthlyBudgetDefault,
  patchMonthlyBudgetDefault,
  postBudgetPeriod,
} from "./_lib/api"

function currentYearMonth(): { year: number; month: number } {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function formatWithComma(value: string): string {
  const digits = value.replace(/\D/g, "")
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function parseDigits(value: string): string {
  return value.replace(/\D/g, "")
}

function formatYearMonth(year: number, month: number): string {
  return `${year}.${month}`
}

type BudgetFormSize = "md" | "sm"

export const BudgetForm = ({
  className,
  size = "md",
  onSubmit: onSubmitProp,
  ...props
}: React.ComponentProps<"form"> & { size?: BudgetFormSize }) => {
  const [budgetValue, setBudgetValue] = React.useState("")
  const [startBudgetValue, setStartBudgetValue] = React.useState("")
  const [monthPickerOpen, setMonthPickerOpen] = React.useState(false)
  const [selectedYearMonth, setSelectedYearMonth] = React.useState(
    currentYearMonth,
  )
  const [viewYear, setViewYear] = React.useState(() => new Date().getFullYear())
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const budgetPeriodFetchId = React.useRef(0)

  React.useEffect(() => {
    let cancelled = false
    getMonthlyBudgetDefault()
      .then((data) => {
        if (cancelled) return
        const raw = data.defaultMonthlyBudget ?? 0
        setStartBudgetValue(String(Math.max(0, Math.floor(raw))))
      })
      .catch(() => {
        if (!cancelled) setStartBudgetValue("0")
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    const fetchId = ++budgetPeriodFetchId.current
    const { year, month } = selectedYearMonth
    getBudgetPeriod(year, month)
      .then((data) => {
        if (fetchId !== budgetPeriodFetchId.current) return
        const raw = data.budgetAmount ?? 0
        setBudgetValue(String(Math.max(0, Math.floor(raw))))
      })
      .catch(() => {
        if (fetchId !== budgetPeriodFetchId.current) return
        setBudgetValue("0")
      })
  }, [selectedYearMonth.year, selectedYearMonth.month])

  React.useEffect(() => {
    if (monthPickerOpen) {
      setViewYear(selectedYearMonth.year)
    }
  }, [monthPickerOpen, selectedYearMonth.year])

  const isSm = size === "sm"
  const inputSizeClass = isSm ? "h-[54px] w-full text-sm" : "h-[64px] w-full text-base"
  const activeInputClass =
    "border-2 border-[#F97B22] rounded-[16px] focus:border-[#F97B22] focus-visible:border-[#F97B22]"

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const defaultMonthlyBudget =
        Number.parseInt(parseDigits(startBudgetValue), 10) || 0
      const { year, month } = selectedYearMonth
      const budgetAmount = Number.parseInt(parseDigits(budgetValue), 10) || 0
      const monthlyDefaultPayload = { defaultMonthlyBudget }
      const periodPayload = { year, month, budgetAmount }

      console.log("월별 예산 선택:")
      console.log(
        `year: ${periodPayload.year}, month: ${periodPayload.month}, budgetAmount: ${periodPayload.budgetAmount.toLocaleString()}`,
      )
      console.log("[budget] periodPayload(JSON):", JSON.stringify(periodPayload))
      console.log("매달 시작 예산:")
      console.log(
        `defaultMonthlyBudget: ${monthlyDefaultPayload.defaultMonthlyBudget.toLocaleString()}`,
      )
      console.log(
        "[budget] monthlyDefaultPayload(JSON):",
        JSON.stringify(monthlyDefaultPayload),
      )

      await patchMonthlyBudgetDefault(monthlyDefaultPayload)
      await postBudgetPeriod(periodPayload)

      onSubmitProp?.(e)
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "저장에 실패했습니다.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className={cn("flex w-full flex-col items-center", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <section className="w-full border-y border-[#D9D9D9] py-8">
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                id="monthly-budget-heading"
                className="text-sm font-medium"
              >
                월별 예산 선택(기본값: 이번 달)
              </span>
              <PopoverPrimitive.Root
                open={monthPickerOpen}
                onOpenChange={setMonthPickerOpen}
              >
                <PopoverPrimitive.Anchor asChild>
                  <div className="flex items-center gap-2">
                    <Input
                      id="date-range"
                      readOnly
                      placeholder={formatYearMonth(
                        new Date().getFullYear(),
                        new Date().getMonth() + 1,
                      )}
                      value={formatYearMonth(
                        selectedYearMonth.year,
                        selectedYearMonth.month,
                      )}
                      className={cn(
                        "h-10 w-[140px] cursor-pointer bg-white px-3 text-base shadow-xs",
                        activeInputClass,
                      )}
                      aria-label="적용할 연·월"
                      onClick={() => setMonthPickerOpen(true)}
                      onFocus={() => setMonthPickerOpen(true)}
                    />
                    <PopoverPrimitive.Trigger asChild>
                      <button
                        type="button"
                        className="shrink-0 rounded-sm p-0.5 outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="달력 열기"
                      >
                        <Image
                          src="/assets/icons/calendar.png"
                          alt=""
                          width={24}
                          height={24}
                        />
                      </button>
                    </PopoverPrimitive.Trigger>
                  </div>
                </PopoverPrimitive.Anchor>
                <PopoverPrimitive.Portal>
                  <PopoverPrimitive.Content
                    align="start"
                    sideOffset={8}
                    className={cn(
                      "z-50 w-[min(100vw-2rem,280px)] rounded-md border bg-popover p-3 text-popover-foreground shadow-md outline-none",
                      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
                        onClick={() => setViewYear((y) => y - 1)}
                        aria-label="이전 연도"
                      >
                        <ChevronLeftIcon className="size-4" />
                      </button>
                      <span className="text-sm font-semibold tabular-nums">
                        {viewYear}년
                      </span>
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
                        onClick={() => setViewYear((y) => y + 1)}
                        aria-label="다음 연도"
                      >
                        <ChevronRightIcon className="size-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                        const isSelected =
                          selectedYearMonth.year === viewYear &&
                          selectedYearMonth.month === m
                        return (
                          <button
                            key={m}
                            type="button"
                            className={cn(
                              "rounded-md py-2 text-sm font-medium transition-colors hover:bg-accent",
                              isSelected &&
                                "bg-[#F97B22] text-white hover:bg-[#F97B22] hover:text-white",
                            )}
                            onClick={() => {
                              setSelectedYearMonth({ year: viewYear, month: m })
                              setMonthPickerOpen(false)
                            }}
                          >
                            {m}월
                          </button>
                        )
                      })}
                    </div>
                  </PopoverPrimitive.Content>
                </PopoverPrimitive.Portal>
              </PopoverPrimitive.Root>
            </div>
            <Input
              id="monthly-budget"
              placeholder=""
              value={formatWithComma(budgetValue)}
              onChange={(e) => setBudgetValue(parseDigits(e.target.value))}
              className={cn(inputSizeClass, activeInputClass)}
              aria-labelledby="monthly-budget-heading"
            />
          </div>
          <div className="flex flex-col gap-4">
            <label htmlFor="start-monthly-budget" className="w-full text-sm font-medium">
              매달 시작 예산
            </label>
            <Input
              id="start-monthly-budget"
              placeholder="3,000,000"
              value={formatWithComma(startBudgetValue)}
              onChange={(e) => setStartBudgetValue(parseDigits(e.target.value))}
              className={cn(inputSizeClass, activeInputClass)}
            />
          </div>
        </div>
      </section>
      <div className="w-full pt-8">
        {submitError ? (
          <p className="mb-3 text-center text-sm text-red-600" role="alert">
            {submitError}
          </p>
        ) : null}
        <Button
          type="submit"
          size={isSm ? "sm" : "lg"}
          disabled={isSubmitting}
          className={cn("w-full", isSm ? "h-[54px]" : "h-[64px]")}
        >
          {isSubmitting ? "저장 중…" : "수정하기"}
        </Button>
      </div>
    </form>
  )
}