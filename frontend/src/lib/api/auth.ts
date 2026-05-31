import { encryptPasswordForTransportIfConfigured } from "@/lib/crypto/password-transport";
import {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants";
import { persistMembershipRoleFromLoginData } from "@/lib/auth/session-storage";
import { API_BASE_URL } from "@/lib/env";

export {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
} from "@/lib/auth/constants";
export { AUTH_MEMBERSHIP_ROLE_KEY } from "@/lib/auth/constants";

/** 필드 의미 순서: email → password → invitationToken (Swagger `LoginDto`와 동일) */
export type LoginPayload = {
  email: string;
  password: string;
  /** 초대 수락 플로우일 때만 값 전달. 없으면 요청 본문에서는 `""`로 전송 */
  invitationToken?: string;
};

/**
 * Swagger `POST /api/auth/login` 요청 본문 (`application/json`).
 * 항상 `email`, `password`, `invitationToken` 세 필드, **위 순서대로** 직렬화합니다.
 */
export type LoginApiRequestBody = {
  email: string;
  password: string;
  invitationToken: string;
};

function normalizeInvitationToken(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function buildLoginRequestBody(
  payload: LoginPayload
): Promise<LoginApiRequestBody> {
  const password = await encryptPasswordForTransportIfConfigured(
    payload.password
  );
  return {
    email: payload.email.trim(),
    password,
    invitationToken: normalizeInvitationToken(payload.invitationToken),
  };
}

/**
 * JSON 키 순서를 Swagger 예시와 동일하게 고정 (`email` → `password` → `invitationToken`).
 * `password`는 RSA 공개키가 설정된 경우 Base64 암호문, 아니면 평문(HTTPS 전송).
 */
async function serializeLoginRequestBody(
  payload: LoginPayload
): Promise<string> {
  const { email, password, invitationToken } = await buildLoginRequestBody(
    payload
  );
  return `{"email":${JSON.stringify(email)},"password":${JSON.stringify(password)},"invitationToken":${JSON.stringify(invitationToken)}}`;
}

/**
 * `POST /api/auth/signup` — 최초 기업담당자(조직 생성) 가입 전용.
 * 초대로 가입하는 일반 회원·조직 관리자는 메일의 `/invite/accept?token=…` → `/invitations/signup` + `POST /api/invitations/signup` 플로우입니다.
 */
export type AdminSignupPayload = {
  email: string;
  password: string;
  displayName: string;
  organizationName: string;
  businessNumber: string;
};

const SERVER_ERROR_HINT_KO =
  "서버에 일시적인 오류가 있습니다. 잠시 후 다시 시도해 주세요. 계속되면 백엔드 담당자에게 문의해 주세요.";

function isGenericInternalFailure(
  status: number,
  o: Record<string, unknown>
): boolean {
  if (status < 500) return false;
  if (o.errorCode === "INTERNAL_SERVER_ERROR") return true;
  const msg = o.message;
  if (typeof msg === "string" && msg.toLowerCase() === "internal server error")
    return true;
  return false;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (!data || typeof data !== "object") {
      return res.status >= 500 ? SERVER_ERROR_HINT_KO : `요청에 실패했습니다. (${res.status})`;
    }
    const o = data as Record<string, unknown>;
    if (isGenericInternalFailure(res.status, o)) return SERVER_ERROR_HINT_KO;
    if (typeof o.message === "string") return o.message;
    if (Array.isArray(o.message)) return o.message.map(String).join(", ");
    if (typeof o.detail === "string") return o.detail;
    if (Array.isArray(o.detail)) {
      return o.detail
        .map((item) =>
          typeof item === "object" && item !== null && "msg" in item
            ? String((item as { msg: string }).msg)
            : String(item)
        )
        .join(", ");
    }
  } catch {
    // ignore
  }
  return res.status >= 500 ? SERVER_ERROR_HINT_KO : `요청에 실패했습니다. (${res.status})`;
}

function persistAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
}

/** 백엔드가 camelCase / snake_case 혼용할 수 있어 둘 다 허용 */
function extractTokensFromLoginData(data: Record<string, unknown>): {
  accessToken: string;
  refreshToken: string;
} | null {
  const fromObject = (t: Record<string, unknown> | undefined) => {
    if (!t) return null;
    const access =
      (typeof t.accessToken === "string" && t.accessToken) ||
      (typeof t.access_token === "string" && t.access_token) ||
      null;
    const refresh =
      (typeof t.refreshToken === "string" && t.refreshToken) ||
      (typeof t.refresh_token === "string" && t.refresh_token) ||
      null;
    if (access && refresh) return { accessToken: access, refreshToken: refresh };
    return null;
  };

  const nested = fromObject(data.tokens as Record<string, unknown> | undefined);
  if (nested) return nested;
  return fromObject(data);
}

/**
 * POST /api/auth/login — 일반·관리자 공통 로그인
 * 응답: `success` + `data.tokens.accessToken` · `refreshToken`, 이후 API는 `Bearer accessToken`
 */
export async function login(
  payload: LoginPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const loginUrl =
    typeof window !== "undefined"
      ? "/api/auth/login"
      : `${API_BASE_URL}/api/auth/login`;

  let requestBody: string;
  try {
    requestBody = await serializeLoginRequestBody(payload);
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "비밀번호 처리 중 오류가 발생했습니다.";
    return { ok: false, message: msg };
  }

  const res = await fetch(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }

  if (res.ok && body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (o.success === true && o.data && typeof o.data === "object") {
      const data = o.data as Record<string, unknown>;
      const pair = extractTokensFromLoginData(data);
      if (pair) {
        persistAuthTokens(pair.accessToken, pair.refreshToken);
        persistMembershipRoleFromLoginData(data, pair.accessToken);
        return { ok: true };
      }
      return {
        ok: false,
        message:
          "로그인 응답에 토큰이 없습니다. 백엔드 담당자에게 문의해 주세요.",
      };
    }
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (isGenericInternalFailure(res.status, o)) {
      return { ok: false, message: SERVER_ERROR_HINT_KO };
    }
    if (typeof o.message === "string") {
      return { ok: false, message: o.message };
    }
    if (Array.isArray(o.message)) {
      return { ok: false, message: o.message.map(String).join(", ") };
    }
  }

  return {
    ok: false,
    message:
      res.status >= 500
        ? SERVER_ERROR_HINT_KO
        : `요청에 실패했습니다. (${res.status})`,
  };
}

/**
 * POST /api/auth/signup — 기업담당자 최초 회원가입
 */
export async function signupAdmin(
  payload: AdminSignupPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  let password: string;
  try {
    password = await encryptPasswordForTransportIfConfigured(payload.password);
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "비밀번호 처리 중 오류가 발생했습니다.";
    return { ok: false, message: msg };
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      password,
    }),
  });

  if (res.status === 201) {
    return { ok: true };
  }

  const message = await readErrorMessage(res);
  return { ok: false, message };
}

/** 초대 수락 회원가입 (`POST /api/invitations/signup`) — 본문은 `token`·`password`·`displayName`만 허용 */
export type InvitationSignupPayload = {
  token: string;
  password: string;
  /** 1~100자, 문자열 */
  displayName: string;
};

/**
 * POST /api/invitations/signup — 초대를 통한 일반·관리자(조직원) 가입
 * 응답에 토큰이 있으면 로그인과 동일하게 세션에 저장합니다.
 */
export async function signupWithInvitation(
  payload: InvitationSignupPayload
): Promise<
  { ok: true; sessionStarted: boolean } | { ok: false; message: string }
> {
  const token = normalizeInvitationToken(payload.token);
  if (!token) {
    return { ok: false, message: "유효한 초대 정보가 없습니다." };
  }

  const displayName = payload.displayName.trim();
  if (displayName.length < 1 || displayName.length > 100) {
    return {
      ok: false,
      message: "이름(표시 이름)은 1자 이상 100자 이하여야 합니다.",
    };
  }

  let password: string;
  try {
    password = await encryptPasswordForTransportIfConfigured(payload.password);
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : "비밀번호 처리 중 오류가 발생했습니다.";
    return { ok: false, message: msg };
  }

  /** 객체 리터럴 대신 고정 키만 직렬화 (email·invitationToken 등 불필요 키가 섞이지 않도록) */
  const requestBody = `{"token":${JSON.stringify(token)},"password":${JSON.stringify(password)},"displayName":${JSON.stringify(displayName)}}`;

  const signupUrl =
    typeof window !== "undefined"
      ? "/api/invitations/signup"
      : `${API_BASE_URL}/api/invitations/signup`;

  const res = await fetch(signupUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: requestBody,
  });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }

  if (res.ok && (res.status === 201 || res.status === 200)) {
    if (body && typeof body === "object") {
      const o = body as Record<string, unknown>;
      if (o.success === false) {
        // 본문이 실패 응답인 경우 아래 공통 오류 처리로 넘깁니다.
      } else {
        const data =
          o.data && typeof o.data === "object"
            ? (o.data as Record<string, unknown>)
            : o;
        const pair = extractTokensFromLoginData(data);
        if (pair) {
          persistAuthTokens(pair.accessToken, pair.refreshToken);
          persistMembershipRoleFromLoginData(data, pair.accessToken);
          return { ok: true, sessionStarted: true };
        }
        return { ok: true, sessionStarted: false };
      }
    } else {
      return { ok: true, sessionStarted: false };
    }
  }

  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (isGenericInternalFailure(res.status, o)) {
      return { ok: false, message: SERVER_ERROR_HINT_KO };
    }
    if (typeof o.message === "string") return { ok: false, message: o.message };
    if (Array.isArray(o.message)) {
      return { ok: false, message: o.message.map(String).join(", ") };
    }
    if (typeof o.detail === "string") return { ok: false, message: o.detail };
  }

  return {
    ok: false,
    message:
      res.status >= 500
        ? SERVER_ERROR_HINT_KO
        : `요청에 실패했습니다. (${res.status})`,
  };
}
