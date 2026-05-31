import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants"
import type {
  GetBudgetPeriodResponse,
  GetMonthlyBudgetDefaultResponse,
  PatchMonthlyBudgetDefaultBody,
  PostBudgetPeriodBody,
} from "./types"

/**
 * 동일 출처 Next Route Handler로 백엔드 프록시:
 * `/api/budget/*`, `/api/expenses` 등
 */
function sameOriginApiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (normalized.startsWith("/api/")) return normalized
  return `/api/budget${normalized}`
}

function normalizeStoredToken(raw: string | null): string | null {
  if (raw == null) return null
  const t = raw.trim()
  return t.length > 0 ? t : null
}

function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null
  return normalizeStoredToken(
    localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token") ??
      localStorage.getItem("authToken"),
  )
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1]
    if (!payloadPart) return null
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return null
  }
}

/** exp가 없거나 파싱 실패면 만료로 보지 않음(불필요한 refresh 방지) */
function isAccessTokenExpiredOrExpiringSoon(
  token: string,
  skewSeconds = 60,
): boolean {
  const payload = decodeJwtPayload(token)
  const expRaw = payload?.exp
  if (expRaw === undefined || expRaw === null) return false
  const exp = Number(expRaw)
  if (!Number.isFinite(exp)) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec + skewSeconds
}

function resolveOrganizationIdFromToken(token: string | null): string | null {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const raw =
    payload?.organizationId ??
    payload?.organization_id ??
    payload?.orgId ??
    payload?.org_id
  if (raw === undefined || raw === null) return null
  const value = String(raw).trim()
  return value.length > 0 ? value : null
}

function persistTokensFromRefresh(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
}

/** 로그인 응답과 동일하게 `data.tokens` 또는 최상위에서 토큰 추출 */
function extractTokensFromRefreshPayload(data: Record<string, unknown>): {
  accessToken: string
  refreshToken: string
} | null {
  const fromObject = (t: Record<string, unknown> | undefined) => {
    if (!t) return null
    const access =
      (typeof t.accessToken === "string" && t.accessToken) ||
      (typeof t.access_token === "string" && t.access_token) ||
      null
    const refresh =
      (typeof t.refreshToken === "string" && t.refreshToken) ||
      (typeof t.refresh_token === "string" && t.refresh_token) ||
      null
    if (access && refresh) return { accessToken: access, refreshToken: refresh }
    return null
  }
  const nested = fromObject(data.tokens as Record<string, unknown> | undefined)
  if (nested) return nested
  return fromObject(data)
}

/**
 * `POST /api/auth/refresh` — 동일 출처 프록시 `src/app/api/auth/refresh/route.ts` 사용.
 */
async function tryRefreshAuthTokens(): Promise<boolean> {
  if (typeof window === "undefined") return false
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)?.trim()
  if (!refreshToken) return false

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  let body: unknown = null
  try {
    body = await res.json()
  } catch {
    return false
  }

  if (!res.ok || !body || typeof body !== "object") return false
  const o = body as Record<string, unknown>
  if (o.success !== true || !o.data || typeof o.data !== "object") return false
  const pair = extractTokensFromRefreshPayload(o.data as Record<string, unknown>)
  if (!pair) return false
  persistTokensFromRefresh(pair.accessToken, pair.refreshToken)
  return true
}

/**
 * 호출 직전: access 만료(또는 곧 만료)면 refresh 시도 후 최신 access 반환.
 * refresh 실패 시 null (저장된 access가 없을 때와 동일하게 처리).
 */
async function getAccessTokenForRequest(): Promise<string | null> {
  let access = getAccessTokenFromStorage()
  if (!access) return null

  if (!isAccessTokenExpiredOrExpiringSoon(access)) {
    return access
  }

  const ok = await tryRefreshAuthTokens()
  if (!ok) {
    return null
  }

  access = getAccessTokenFromStorage()
  return access
}

function parseErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string") {
    const trimmed = payload.trim()
    return trimmed ? trimmed : fallback
  }

  if (!payload || typeof payload !== "object") return fallback

  const root = payload as Record<string, unknown>
  const data =
    "data" in root &&
    root.data &&
    typeof root.data === "object" &&
    !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : null

  const messageField = root.message
  if (Array.isArray(messageField)) {
    const parts = messageField.filter((x): x is string => typeof x === "string")
    if (parts.length > 0) return parts.join(" ")
  }

  const candidates: unknown[] = [
    messageField,
    root.error,
    root.detail,
    data?.message,
    data?.error,
    data?.detail,
  ]

  const text = candidates.find((value) => typeof value === "string") as
    | string
    | undefined
  return text ?? fallback
}

type RequestApiOptions = {
  suppressLogStatuses?: number[]
  maxRateLimitAttempts?: number
}

async function requestApi<T>(
  path: string,
  init?: RequestInit,
  options?: RequestApiOptions,
): Promise<T> {
  let token = await getAccessTokenForRequest()
  const organizationId = resolveOrganizationIdFromToken(token)
  const hasBody = init?.body !== undefined

  const url = sameOriginApiPath(path)

  const doFetch = () =>
    fetch(url, {
      ...init,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(organizationId ? { "X-Organization-Id": organizationId } : {}),
        ...(init?.headers ?? {}),
      },
    })

  let response = await doFetch()

  // access 만료로 401이 온 경우 한 번만 refresh 후 재시도
  if (response.status === 401 && localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)) {
    const refreshed = await tryRefreshAuthTokens()
    if (refreshed) {
      token = getAccessTokenFromStorage()
      const orgId = resolveOrganizationIdFromToken(token)
      response = await fetch(url, {
        ...init,
        headers: {
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(orgId ? { "X-Organization-Id": orgId } : {}),
          ...(init?.headers ?? {}),
        },
      })
    }
  }

  // 429 Too Many Requests — 응답 본문을 소비한 뒤 Retry-After·지수 백오프로 재시도
  let rateLimitAttempt = 0
  const maxRateLimitAttempts = Math.max(0, options?.maxRateLimitAttempts ?? 4)
  while (response.status === 429 && rateLimitAttempt < maxRateLimitAttempts) {
    rateLimitAttempt++
    await response.text()
    const ra = response.headers.get("retry-after")
    let waitMs = Math.min(1500 * 2 ** (rateLimitAttempt - 1), 20_000)
    if (ra) {
      const sec = Number.parseInt(ra, 10)
      if (Number.isFinite(sec)) waitMs = Math.min(sec * 1000, 30_000)
    }
    await new Promise((r) => setTimeout(r, waitMs))
    response = await doFetch()
  }

  const text = await response.text()
  let json: unknown = null
  if (text) {
    try {
      json = JSON.parse(text) as unknown
    } catch {
      json = text
    }
  }

  if (!response.ok) {
    const suppressLog = options?.suppressLogStatuses?.includes(response.status) ?? false
    const bodyPreview =
      typeof text === "string" && text.length > 0
        ? text.length > 500
          ? `${text.slice(0, 500)}…`
          : text
        : "(응답 본문 없음)"
    const parsedForLog =
      json === null || json === undefined
        ? null
        : typeof json === "object" &&
            !Array.isArray(json) &&
            Object.keys(json as object).length === 0
          ? "(빈 JSON 객체 — raw는 bodyPreview 참고)"
          : json
    if (!suppressLog) {
      const logLine = `[api] ${init?.method ?? "GET"} ${url} → ${response.status} ${response.statusText}`
      if (response.status === 429) {
        console.warn(logLine, { bodyPreview, parsed: parsedForLog })
      } else {
        console.error(logLine, { bodyPreview, parsed: parsedForLog })
      }
    }
    if (response.status === 401) {
      throw new Error(
        parseErrorMessage(
          json,
          "Unauthorized: 로그인 상태 또는 토큰을 확인해주세요.",
        ),
      )
    }
    if (response.status === 403) {
      throw new Error("권한이 없습니다. super_admin 권한이 필요합니다.")
    }
    throw new Error(
      parseErrorMessage(
        json,
        `요청 처리에 실패했습니다. (${response.status})`,
      ),
    )
  }

  return json as T
}

function unwrapDataObject(data: unknown): Record<string, unknown> | null {
  if (typeof data !== "object" || data === null) return null
  const root = data as Record<string, unknown>
  const inner =
    root.data !== undefined &&
    root.data !== null &&
    typeof root.data === "object" &&
    !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root
  return inner
}

function normalizeMonthlyDefault(data: unknown): GetMonthlyBudgetDefaultResponse {
  const o = unwrapDataObject(data)
  if (!o) {
    return { defaultMonthlyBudget: 0 }
  }
  const camel = o.defaultMonthlyBudget
  const snake = o.default_monthly_budget
  const n =
    typeof camel === "number"
      ? camel
      : typeof snake === "number"
        ? snake
        : typeof camel === "string"
          ? Number(camel)
          : typeof snake === "string"
            ? Number(snake)
            : NaN
  return {
    defaultMonthlyBudget: Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0,
  }
}

function normalizeBudgetPeriod(data: unknown): GetBudgetPeriodResponse {
  const o = unwrapDataObject(data)
  if (!o) {
    return { budgetAmount: 0, hasPeriodConfigured: false }
  }
  const configured =
    o.hasPeriodConfigured === true || o.has_period_configured === true

  const camel = o.budgetAmount
  const snake = o.budget_amount
  const raw =
    camel === null || camel === undefined
      ? snake === null || snake === undefined
        ? null
        : snake
      : camel
  if (raw === null || raw === undefined) {
    return { budgetAmount: 0, hasPeriodConfigured: configured }
  }
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : NaN
  const parsed = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  return {
    budgetAmount: configured ? parsed : 0,
    hasPeriodConfigured: configured,
  }
}

/** GET /api/budget/monthly-default — 조직 "매달 시작 예산" 기본값(관리자). null/누락 시 0. */
export async function getMonthlyBudgetDefault(): Promise<GetMonthlyBudgetDefaultResponse> {
  const payload = await requestApi<unknown>("/api/budget/monthly-default")
  return normalizeMonthlyDefault(payload)
}

/**
 * GET /api/budget/periods?year=&month= — 해당 연·월 예산액(멤버 가능).
 * 백엔드 `GET /budget/monthly-default`는 연·월을 받지 않으므로, 월별 금액은 이 API로 조회합니다.
 */
export async function getBudgetPeriod(
  year: number,
  month: number,
): Promise<GetBudgetPeriodResponse> {
  const q = new URLSearchParams({
    year: String(year),
    month: String(month),
  })
  const payload = await requestApi<unknown>(
    `/api/budget/periods?${q.toString()}`,
  )
  return normalizeBudgetPeriod(payload)
}

/** PATCH /api/budget/monthly-default */
export async function patchMonthlyBudgetDefault(
  body: PatchMonthlyBudgetDefaultBody,
): Promise<void> {
  await requestApi("/api/budget/monthly-default", {
    method: "PATCH",
    body: JSON.stringify({ defaultMonthlyBudget: body.defaultMonthlyBudget }),
  })
}

/** POST /api/budget/periods */
export async function postBudgetPeriod(body: PostBudgetPeriodBody): Promise<void> {
  await requestApi("/api/budget/periods", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Budget periods summary / remaining (구매 상세·구매내역 카드 등)
// 동일 출처 `/api/budget/*` + refresh 재시도 — 백엔드 직접 호출보다 인증이 안정적입니다.
// ---------------------------------------------------------------------------

export interface BudgetSummaryResult {
  year: number
  month: number
  budgetAmount: string
  spentAmount: string
  reservedActiveAmount: string
  remainingAmount: string
  hasPeriodConfigured: boolean
}

const budgetSummaryValueCache = new Map<string, BudgetSummaryResult>()
const budgetSummaryInFlightCache = new Map<string, Promise<BudgetSummaryResult>>()

function budgetSummaryCacheKey(year: number, month: number): string {
  return `${year}-${month}`
}

function unwrapBudgetEnvelope(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data ?? null
  }
  return payload
}

function isBudgetRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseYearMonth(record: Record<string, unknown>): { y: number; m: number } | null {
  let y = Number(record.year)
  let m = Number(record.month)
  if ((!Number.isFinite(y) || !Number.isFinite(m)) && isBudgetRecord(record.yearMonth)) {
    y = Number(record.yearMonth.year)
    m = Number(record.yearMonth.month)
  }
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null
  return { y, m }
}

function parseRemainingAmount(record: Record<string, unknown>): number | null {
  const raw =
    record.remainingAmount ??
    record.remaining_amount ??
    record.remainingBudget ??
    record.remaining_budget
  if (raw === undefined || raw === null) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** GET `/api/budget/periods/summary` 응답 */
function pickRemainingFromSummaryPayload(payload: unknown): number | null {
  const tryRecord = (r: Record<string, unknown>): number | null => {
    const direct = parseRemainingAmount(r)
    if (direct !== null) return direct
    if (isBudgetRecord(r.summary)) {
      const nested = parseRemainingAmount(r.summary)
      if (nested !== null) return nested
    }
    if (isBudgetRecord(r.data)) {
      const nested = parseRemainingAmount(r.data)
      if (nested !== null) return nested
    }
    return null
  }

  if (isBudgetRecord(payload)) {
    const fromRoot = tryRecord(payload)
    if (fromRoot !== null) return fromRoot
  }
  const inner = unwrapBudgetEnvelope(payload)
  if (isBudgetRecord(inner)) {
    const fromInner = tryRecord(inner)
    if (fromInner !== null) return fromInner
  }
  return null
}

function pickBudgetPeriodList(payload: unknown): Record<string, unknown>[] {
  const inner = unwrapBudgetEnvelope(payload)
  if (Array.isArray(inner)) {
    return inner.filter(isBudgetRecord) as Record<string, unknown>[]
  }
  if (!isBudgetRecord(inner)) return []
  const nested = [inner.periods, inner.items, inner.list, inner.content, inner.results]
  for (const c of nested) {
    if (Array.isArray(c)) return c.filter(isBudgetRecord) as Record<string, unknown>[]
  }
  if (
    parseRemainingAmount(inner) !== null ||
    inner.budgetAmount !== undefined ||
    inner.budget_amount !== undefined
  ) {
    return [inner]
  }
  return []
}

/** GET `/api/budget/periods` 목록에서 남은 예산 추출 */
export function extractRemainingFromPeriodsPayload(
  payload: unknown,
  year: number,
  month: number,
): number | null {
  const list = pickBudgetPeriodList(payload)
  const match = list.find((row) => {
    const ym = parseYearMonth(row)
    return ym && ym.y === year && ym.m === month
  })
  const target = match ?? list[0]
  if (!target) return null
  return parseRemainingAmount(target)
}

/** GET `/api/budget/periods/summary` — 구매 상세 등 */
export async function getBudgetSummary(params: {
  year: number
  month: number
}): Promise<BudgetSummaryResult> {
  const key = budgetSummaryCacheKey(params.year, params.month)
  if (budgetSummaryValueCache.has(key)) {
    return budgetSummaryValueCache.get(key) as BudgetSummaryResult
  }

  const inFlight = budgetSummaryInFlightCache.get(key)
  if (inFlight) return inFlight

  const query = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
  })
  const task = requestApi<unknown>(
    `/api/budget/periods/summary?${query.toString()}`,
    undefined,
    { maxRateLimitAttempts: 0 },
  )
    .then((payload) => unwrapBudgetEnvelope(payload) as BudgetSummaryResult)
    .then((result) => {
      budgetSummaryValueCache.set(key, result)
      return result
    })
    .catch((error) => {
      budgetSummaryInFlightCache.delete(key)
      throw error
    })
    .finally(() => {
      budgetSummaryInFlightCache.delete(key)
    })

  budgetSummaryInFlightCache.set(key, task)
  return task
}

/**
 * 이번 달 남은 예산: summary 우선, 없으면 periods 목록.
 */
export async function fetchMonthlyRemainingBudgetFromPeriods(params: {
  year: number
  month: number
}): Promise<number | null> {
  const query = new URLSearchParams({
    year: String(params.year),
    month: String(params.month),
  })
  const q = query.toString()

  try {
    const summaryPayload = await requestApi<unknown>(`/api/budget/periods/summary?${q}`)
    const fromSummary = pickRemainingFromSummaryPayload(summaryPayload)
    if (fromSummary !== null) return fromSummary
  } catch {
    // summary 실패 시 periods로 보조
  }

  const payload = await requestApi<unknown>(`/api/budget/periods?${q}`)
  return extractRemainingFromPeriodsPayload(payload, params.year, params.month)
}

function parseMoneyScalar(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const n = Number(value.replace(/,/g, "").replace(/\s/g, ""))
    return Number.isFinite(n) ? n : null
  }
  return null
}

/**
 * 지출/매출 한 줄에서 금액 필드 추출.
 * 백엔드가 `itemsAmount`(구매 주문 금액)와 다른 의미의 `amount`를 같이 줄 수 있어 `itemsAmount`를 우선합니다.
 */
function pickExpenseRowAmount(row: Record<string, unknown>): number | null {
  const keys = [
    "itemsAmount",
    "items_amount",
    "itemAmount",
    "item_amount",
    "paidAmount",
    "paid_amount",
    "purchaseAmount",
    "purchase_amount",
    "totalSpent",
    "total_spent",
    "expenseTotal",
    "expense_total",
    "totalAmount",
    "total_amount",
    "lineTotal",
    "line_total",
    "grossAmount",
    "gross_amount",
    "spentAmount",
    "spent_amount",
    "amount",
    "price",
  ] as const
  for (const k of keys) {
    const n = parseMoneyScalar(row[k])
    if (n !== null) return n
  }
  const purchaseOrder = row.purchaseOrder ?? row.purchase_order
  if (isBudgetRecord(purchaseOrder)) {
    for (const k of keys) {
      const n = parseMoneyScalar(purchaseOrder[k])
      if (n !== null) return n
    }
  }
  return null
}

const EXPENSE_ROW_ARRAY_KEYS = [
  "data",
  "items",
  "expenses",
  "list",
  "content",
  "results",
  "rows",
  "records",
  "elements",
] as const

/**
 * `{ data: [...] }`, `{ items: [...] }`, `{ data: { data: [...] } }` 등 GET /api/expenses 변형
 */
function collectExpenseRowsFromNode(node: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 5) return []
  if (Array.isArray(node)) {
    const rows = node.filter(isBudgetRecord) as Record<string, unknown>[]
    if (rows.length > 0) return rows
    return []
  }
  if (!isBudgetRecord(node)) return []
  for (const k of EXPENSE_ROW_ARRAY_KEYS) {
    const c = node[k]
    if (Array.isArray(c)) {
      const rows = c.filter(isBudgetRecord) as Record<string, unknown>[]
      if (rows.length > 0) return rows
    }
  }
  const dataChild = node.data
  if (dataChild !== undefined && dataChild !== null) {
    const nested = collectExpenseRowsFromNode(dataChild, depth + 1)
    if (nested.length > 0) return nested
  }
  return []
}

/** GET `/api/expenses` 응답에서 지출 행 배열만 추출 (구매요청 ID·기록자 매핑용) */
function pickExpenseRowsFromPayload(payload: unknown): Record<string, unknown>[] {
  const inner = unwrapBudgetEnvelope(payload)
  const fromInner = collectExpenseRowsFromNode(inner)
  if (fromInner.length > 0) return fromInner
  if (isBudgetRecord(payload)) {
    const fromRoot = collectExpenseRowsFromNode(payload)
    if (fromRoot.length > 0) return fromRoot
  }
  return []
}

/**
 * 기간별 지출 **행** 목록 (`GET /api/expenses?from=...&to=...` 등).
 * 구매내역 상세에서 요청인·담당자 보강에 사용합니다.
 */
export async function fetchExpenseRecordsByDateRange(params: {
  from: string
  to: string
}): Promise<Record<string, unknown>[]> {
  const { from, to } = params
  const paths = [
    `/api/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    `/api/expenses?startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`,
  ]
  let lastRows: Record<string, unknown>[] = []
  for (const path of paths) {
    try {
      const payload = await requestApi<unknown>(path, undefined, {
        suppressLogStatuses: [400, 404],
        maxRateLimitAttempts: 0,
      })
      const rows = pickExpenseRowsFromPayload(payload)
      if (rows.length > 0) return rows
      lastRows = rows
    } catch {
      // 다음 쿼리 형식 시도
    }
  }
  return lastRows
}

/** GET `/api/expenses` — 이번 달 지출 합계 (응답 스키마가 달라질 수 있음) */
function pickTotalExpenseFromPayload(payload: unknown): number | null {
  const inner = unwrapBudgetEnvelope(payload) as unknown

  const rows = collectExpenseRowsFromNode(inner)
  if (rows.length > 0) {
    let sum = 0
    let has = false
    for (const row of rows) {
      const a = pickExpenseRowAmount(row)
      if (a !== null) {
        sum += a
        has = true
      }
    }
    if (has) return sum
  }

  if (isBudgetRecord(inner) && isBudgetRecord(inner.data)) {
    const fromNestedData = pickExpenseRowAmount(inner.data)
    if (fromNestedData !== null) return fromNestedData
  }

  if (isBudgetRecord(inner)) {
    const direct = pickExpenseRowAmount(inner)
    if (direct !== null) return direct
    const summary = inner.summary
    if (isBudgetRecord(summary)) {
      const fromSummary = pickExpenseRowAmount(summary)
      if (fromSummary !== null) return fromSummary
    }
    const meta = inner.meta
    if (isBudgetRecord(meta)) {
      const fromMeta = pickExpenseRowAmount(meta)
      if (fromMeta !== null) return fromMeta
    }
    const n = Number(
      inner.totalAmount ??
        inner.total_amount ??
        inner.totalSpent ??
        inner.total_spent ??
        inner.spentAmount ??
        inner.spent_amount ??
        inner.amount ??
        inner.total ??
        inner.sum ??
        inner.monthlyTotal ??
        inner.monthly_total,
    )
    if (Number.isFinite(n)) return n
  }

  if (isBudgetRecord(payload)) {
    const direct = pickExpenseRowAmount(payload)
    if (direct !== null) return direct
    const n = Number(
      payload.totalAmount ??
        payload.total_amount ??
        payload.spentAmount ??
        payload.spent_amount ??
        payload.amount ??
        payload.total,
    )
    if (Number.isFinite(n)) return n
  }

  return null
}

/**
 * `GET /api/expenses` — 구매내역 「이번 달 지출액」 카드.
 * 백엔드마다 쿼리 스키마가 달라 400이 나면 다른 형태로 순차 재시도합니다.
 */
async function fetchMonthlyExpensesTotalUncached(params: {
  year: number
  month: number
}): Promise<number | null> {
  const { year, month } = params
  const ym = `${year}-${String(month).padStart(2, "0")}`
  const lastDay = new Date(year, month, 0).getDate()
  const from = `${year}-${String(month).padStart(2, "0")}-01`
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`

  const paths: string[] = [
    `/api/expenses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    `/api/expenses?startDate=${encodeURIComponent(from)}&endDate=${encodeURIComponent(to)}`,
    `/api/expenses?yearMonth=${encodeURIComponent(ym)}`,
    `/api/expenses?year=${year}&month=${month}`,
    `/api/expenses`,
  ]

  let lastErr: Error | null = null
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i] ?? ""
    try {
      const payload = await requestApi<unknown>(path, undefined, {
        suppressLogStatuses: [400, 404],
        maxRateLimitAttempts: 0,
      })
      return pickTotalExpenseFromPayload(payload)
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
      const msg = lastErr.message
      // 429·5xx·네트워크는 대체 쿼리로도 동일할 가능성이 높아 추가 요청을 하지 않음
      if (/\(429\)/.test(msg)) throw lastErr
      if (/\((5\d\d)\)/.test(msg)) throw lastErr
      if (/Failed to fetch|NetworkError|ECONNREFUSED|fetch failed/i.test(msg)) throw lastErr
      const canTryAlternate =
        /\((400|404)\)/.test(msg) ||
        /Bad Request/i.test(msg) ||
        /not found/i.test(msg)
      if (canTryAlternate && i < paths.length - 1) {
        await new Promise((r) => setTimeout(r, 400))
        continue
      }
      throw lastErr
    }
  }
  throw lastErr ?? new Error("지출 정보를 불러오지 못했습니다.")
}

const monthlyExpenseValueCache = new Map<string, number | null>()
const monthlyExpenseInFlightCache = new Map<string, Promise<number | null>>()
const expenseRangeValueCache = new Map<string, number | null>()
const expenseRangeInFlightCache = new Map<string, Promise<number | null>>()

/**
 * 구매 승인 등으로 `POST /api/expenses` 이후 같은 세션에서 캐시된 지출 합계가
 * 구매 내역·예산 화면에 남지 않도록 비웁니다.
 */
export function invalidateExpensesClientCache(): void {
  monthlyExpenseValueCache.clear()
  monthlyExpenseInFlightCache.clear()
  expenseRangeValueCache.clear()
  expenseRangeInFlightCache.clear()
}

function expenseCacheKey(year: number, month: number): string {
  return `${year}-${month}`
}

function expenseRangeCacheKey(from: string, to: string): string {
  return `${from}~${to}`
}

/**
 * 월별 지출 조회 캐시:
 * - 같은 월을 여러 화면/이펙트가 동시에 요청하면 1회만 호출
 * - 이미 구한 월은 세션 동안 재사용(429 완화)
 */
export async function fetchMonthlyExpensesTotal(params: {
  year: number
  month: number
}): Promise<number | null> {
  const key = expenseCacheKey(params.year, params.month)
  if (monthlyExpenseValueCache.has(key)) {
    return monthlyExpenseValueCache.get(key) ?? null
  }

  const inFlight = monthlyExpenseInFlightCache.get(key)
  if (inFlight) return inFlight

  const task = fetchMonthlyExpensesTotalUncached(params)
    .then((value) => {
      monthlyExpenseValueCache.set(key, value)
      return value
    })
    .catch((error) => {
      monthlyExpenseInFlightCache.delete(key)
      throw error
    })
    .finally(() => {
      monthlyExpenseInFlightCache.delete(key)
    })

  monthlyExpenseInFlightCache.set(key, task)
  return task
}

/**
 * 기간 지출 합계 조회 (`GET /api/expenses?from=...&to=...`)
 * - 같은 기간은 세션 동안 캐시
 * - 같은 기간 동시 요청은 1회만 수행
 */
export async function fetchExpensesTotalByDateRange(params: {
  from: string
  to: string
}): Promise<number | null> {
  const key = expenseRangeCacheKey(params.from, params.to)
  if (expenseRangeValueCache.has(key)) {
    return expenseRangeValueCache.get(key) ?? null
  }

  const inFlight = expenseRangeInFlightCache.get(key)
  if (inFlight) return inFlight

  const path = `/api/expenses?from=${encodeURIComponent(params.from)}&to=${encodeURIComponent(params.to)}`
  const task = requestApi<unknown>(path, undefined, {
    suppressLogStatuses: [400, 404],
    maxRateLimitAttempts: 0,
  })
    .then((payload) => {
      const value = pickTotalExpenseFromPayload(payload)
      expenseRangeValueCache.set(key, value)
      return value
    })
    .catch((error) => {
      expenseRangeInFlightCache.delete(key)
      throw error
    })
    .finally(() => {
      expenseRangeInFlightCache.delete(key)
    })

  expenseRangeInFlightCache.set(key, task)
  return task
}
