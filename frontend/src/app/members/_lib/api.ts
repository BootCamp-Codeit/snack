import type {
  ChangeMemberRoleInput,
  GetMembersParams,
  GetMembersResult,
  InviteMemberInput,
  Member,
  MemberId,
  MemberRole,
  MemberRoleOption,
} from "./types";

import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants";
import { clearAuthSession } from "@/lib/auth/clear-session";
import { API_BASE_URL } from "@/lib/env";
const ENV_ORGANIZATION_ID = Number(process.env.NEXT_PUBLIC_ORGANIZATION_ID);
let cachedOrganizationId: number | null = null;
const REQUEST_TIMEOUT_MS = 15000;

function parseErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed ? trimmed : fallback;
  }

  if (!payload || typeof payload !== "object") return fallback;

  const data =
    "data" in (payload as Record<string, unknown>) &&
    (payload as { data?: unknown }).data &&
    typeof (payload as { data?: unknown }).data === "object"
      ? ((payload as { data?: unknown }).data as Record<string, unknown>)
      : null;

  const candidates = [
    (payload as { message?: unknown }).message,
    (payload as { error?: unknown }).error,
    (payload as { detail?: unknown }).detail,
    data?.message,
    data?.error,
    data?.detail,
  ];

  const text = candidates.find((value) => typeof value === "string");
  return text ?? fallback;
}

function getDataPayload(payload: unknown) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }

  return payload;
}

function getAccessToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken")
  );
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) ??
    localStorage.getItem("refreshToken") ??
    localStorage.getItem("refresh_token")
  );
}

function extractTokens(payload: unknown): {
  accessToken: string;
  refreshToken: string | null;
} | null {
  if (!payload || typeof payload !== "object") return null;

  const root = payload as Record<string, unknown>;
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;
  const tokens =
    data.tokens && typeof data.tokens === "object"
      ? (data.tokens as Record<string, unknown>)
      : data;

  const accessToken =
    (typeof tokens.accessToken === "string" && tokens.accessToken) ||
    (typeof tokens.access_token === "string" && tokens.access_token) ||
    (typeof data.accessToken === "string" && data.accessToken) ||
    (typeof data.access_token === "string" && data.access_token) ||
    null;

  if (!accessToken) return null;

  const refreshToken =
    (typeof tokens.refreshToken === "string" && tokens.refreshToken) ||
    (typeof tokens.refresh_token === "string" && tokens.refresh_token) ||
    (typeof data.refreshToken === "string" && data.refreshToken) ||
    (typeof data.refresh_token === "string" && data.refresh_token) ||
    null;

  return { accessToken, refreshToken };
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const text = await res.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        json = text;
      }
    }

    if (!res.ok) {
      clearAuthSession();
      return null;
    }

    const tokens = extractTokens(json);
    if (!tokens) {
      clearAuthSession();
      return null;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, tokens.accessToken);
      if (tokens.refreshToken) {
        localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken);
      }
      window.dispatchEvent(new Event("snack-auth-changed"));
    }

    return tokens.accessToken;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const padded = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  let token = getAccessToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const hasBody = init?.body !== undefined;
  const execute = async (bearerToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        ...(init?.headers ?? {}),
      },
    });

  let response: Response;
  try {
    response = await execute(token);
    if (response.status === 401 && path !== "/api/auth/refresh") {
      const nextAccessToken = await refreshAccessToken();
      if (nextAccessToken) {
        token = nextAccessToken;
        response = await execute(token);
      }
    }
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error("네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.");
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text) as unknown;
    } catch {
      json = text;
    }
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(json, "요청 처리에 실패했습니다."));
  }

  return json as T;
}

function normalizeRole(role: unknown): MemberRole {
  if (typeof role !== "string") return "user";

  if (role === "super_admin" || role === "admin") return role;
  if (role === "SUPER_ADMIN") return "super_admin";
  if (role === "ADMIN") return "admin";
  return "user";
}

function toRoleEnum(role: MemberRoleOption) {
  return role === "admin" ? "ADMIN" : "MEMBER";
}

function toMemberId(value: unknown): MemberId | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

function toMember(item: unknown): Member | null {
  const raw = (item ?? {}) as Record<string, unknown>;
  const rawUser =
    raw.user && typeof raw.user === "object"
      ? (raw.user as Record<string, unknown>)
      : null;
  const id = toMemberId(raw.id ?? raw.memberId ?? raw.userId ?? rawUser?.id);
  if (!id) return null;

  return {
    id,
    name: String(
      raw.name ??
        raw.memberName ??
        raw.displayName ??
        rawUser?.name ??
        rawUser?.displayName ??
        "",
    ),
    email: String(raw.email ?? rawUser?.email ?? ""),
    role: normalizeRole(raw.role ?? rawUser?.role),
    active: Boolean(raw.active ?? raw.isActive ?? true),
  };
}

function toMemberArray(payload: unknown) {
  const source = getDataPayload(payload);

  if (Array.isArray(source)) return source;

  if (source && typeof source === "object") {
    const raw = source as Record<string, unknown>;

    if (Array.isArray(raw.members)) return raw.members;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.list)) return raw.list;
    if (raw.data && typeof raw.data === "object") {
      const nested = raw.data as Record<string, unknown>;
      if (Array.isArray(nested.members)) return nested.members;
      if (Array.isArray(nested.items)) return nested.items;
      if (Array.isArray(nested.list)) return nested.list;
    }
  }

  return [];
}

function pickNumber(values: unknown[], fallback: number) {
  const found = values.find((value) => Number.isFinite(Number(value)));
  return found !== undefined ? Number(found) : fallback;
}

async function resolveOrganizationId(explicitOrganizationId?: number) {
  if (
    explicitOrganizationId !== undefined &&
    Number.isFinite(explicitOrganizationId) &&
    explicitOrganizationId > 0
  ) {
    return explicitOrganizationId;
  }

  if (cachedOrganizationId) {
    return cachedOrganizationId;
  }

  if (Number.isFinite(ENV_ORGANIZATION_ID) && ENV_ORGANIZATION_ID > 0) {
    cachedOrganizationId = ENV_ORGANIZATION_ID;
    return ENV_ORGANIZATION_ID;
  }

  const token = getAccessToken();
  if (token) {
    const payload = decodeJwtPayload(token);
    const tokenOrgId = Number(
      payload?.organizationId ??
        payload?.organization_id ??
        payload?.orgId ??
        payload?.org_id,
    );
    if (Number.isFinite(tokenOrgId) && tokenOrgId > 0) {
      cachedOrganizationId = tokenOrgId;
      return tokenOrgId;
    }
  }

  const me = await requestApi<unknown>("/api/organizations/me");
  const meData = getDataPayload(me);
  if (meData && typeof meData === "object") {
    const record = meData as Record<string, unknown>;
    const organization = record.organization as Record<string, unknown> | undefined;
    const id = Number(record.id ?? organization?.id);
    if (Number.isFinite(id) && id > 0) {
      cachedOrganizationId = id;
      return id;
    }
  }

  throw new Error("조직 정보를 찾을 수 없습니다. organizationId를 확인해주세요.");
}

export async function getMembers(
  params: GetMembersParams = {},
): Promise<GetMembersResult> {
  const { keyword = "", page = 1, pageSize = 6 } = params;
  const payload = await requestApi<unknown>("/api/organizations/members");

  const rawMembers = toMemberArray(payload);
  const members = rawMembers
    .map(toMember)
    .filter((member): member is Member => member !== null);
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredMembers = normalizedKeyword
    ? members.filter(
        (member) =>
          member.name.toLowerCase().includes(normalizedKeyword) ||
          member.email.toLowerCase().includes(normalizedKeyword),
      )
    : members;

  const dataPayload = getDataPayload(payload);
  const payloadRecord =
    dataPayload && typeof dataPayload === "object"
      ? (dataPayload as Record<string, unknown>)
      : {};
  const totalCount = pickNumber(
    [
      payloadRecord.totalCount,
      payloadRecord.total,
      payloadRecord.count,
      filteredMembers.length,
    ],
    filteredMembers.length,
  );
  const totalPages = Math.max(
    1,
    pickNumber(
      [
        payloadRecord.totalPages,
        payloadRecord.pageCount,
        Math.ceil(totalCount / pageSize),
      ],
      1,
    ),
  );
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pagedMembers =
    Array.isArray(dataPayload) || !("totalPages" in payloadRecord)
      ? filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)
      : filteredMembers;

  return {
    members: pagedMembers,
    totalCount,
    totalPages,
    page: currentPage,
  };
}

/** 내 프로필 화면용 (GET /api/auth/me 응답에서 추출) */
export type MyOrganizationProfile = {
  companyName: string;
  userName: string;
  email: string;
};

function parseOrganizationMePayload(data: unknown): MyOrganizationProfile {
  const empty: MyOrganizationProfile = {
    companyName: "",
    userName: "",
    email: "",
  };
  if (!data || typeof data !== "object") return empty;
  const r = data as Record<string, unknown>;

  const membership =
    r.membership && typeof r.membership === "object"
      ? (r.membership as Record<string, unknown>)
      : null;

  const organization =
    (r.organization && typeof r.organization === "object"
      ? (r.organization as Record<string, unknown>)
      : null) ??
    (membership?.organization && typeof membership.organization === "object"
      ? (membership.organization as Record<string, unknown>)
      : null);

  const companyName = String(
    organization?.name ??
      organization?.organizationName ??
      r.organizationName ??
      r.companyName ??
      "",
  );

  const user =
    (r.user && typeof r.user === "object"
      ? (r.user as Record<string, unknown>)
      : null) ??
    (membership?.user && typeof membership.user === "object"
      ? (membership.user as Record<string, unknown>)
      : null);

  const userName = String(
    user?.displayName ??
      user?.name ??
      r.displayName ??
      r.name ??
      r.memberName ??
      membership?.displayName ??
      membership?.name ??
      "",
  );

  const email = String(
    user?.email ?? r.email ?? membership?.email ?? "",
  );

  return { companyName, userName, email };
}

/**
 * 로그인한 사용자의 조직·계정 표시 정보.
 * `GET /api/auth/me`
 */
export async function fetchMyOrganizationProfile(): Promise<MyOrganizationProfile> {
  const payload = await requestApi<unknown>("/api/auth/me");
  const data = getDataPayload(payload);
  return parseOrganizationMePayload(data);
}

/**
 * 기업담당자가 조직원(일반·관리자) 초대 메일 발송.
 * 백엔드: `POST /invitations/organizations/{organizationId}/invite` (앱에서는 `/api` 프리픽스 포함)
 * 수신 메일의 가입 링크는 보통 프론트 `/invite/accept?token=…` 입니다.
 */
export async function inviteMember(input: InviteMemberInput) {
  const organizationId = await resolveOrganizationId(input.organizationId);

  await requestApi(`/api/invitations/organizations/${organizationId}/invite`, {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      inviteeName: input.name,
      roleToGrant: toRoleEnum(input.role),
    }),
  });
}

export async function deactivateMember(memberId: MemberId) {
  await requestApi(
    `/api/organizations/members/${encodeURIComponent(String(memberId))}/deactivate`,
    {
      method: "PATCH",
    },
  );
}

export async function changeMemberRole(input: ChangeMemberRoleInput) {
  await requestApi(
    `/api/organizations/members/${encodeURIComponent(String(input.memberId))}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({
        role: toRoleEnum(input.role),
      }),
    },
  );
}
