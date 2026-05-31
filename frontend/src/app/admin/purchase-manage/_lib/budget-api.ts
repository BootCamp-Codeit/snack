"use client";

/**
 * 예산 API는 `@/app/budget-mng/_components/_lib/api` 와 동일하게
 * 동일 출처 `/api/budget/*` + refresh 재시도를 사용합니다.
 * (백엔드 직접 호출 시 401·Unauthorized 가 자주 발생할 수 있음)
 */
export type { BudgetSummaryResult } from "@/app/budget-mng/_components/_lib/api";
export {
  getBudgetSummary,
  fetchMonthlyRemainingBudgetFromPeriods,
  extractRemainingFromPeriodsPayload,
} from "@/app/budget-mng/_components/_lib/api";
