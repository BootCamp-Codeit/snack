export interface GetMonthlyBudgetDefaultResponse {
  /** `default_monthly_budget` — if not set or not applied, then 0 */
  defaultMonthlyBudget: number
}

export interface PatchMonthlyBudgetDefaultBody {
  defaultMonthlyBudget: number
}

export interface PostBudgetPeriodBody {
  year: number
  month: number
  budgetAmount: number
}

/**
 * GET /api/budget/periods?year=&month= — 단일 월 예산.
 * `hasPeriodConfigured`: 관리자가 `POST`로 확정한 적이 있으면 true.
 * false면 DB에 자동 생성된 행뿐이라 UI에서는 미설정으로 0을 보여준다.
 */
export interface GetBudgetPeriodResponse {
  budgetAmount: number
  hasPeriodConfigured: boolean
}
