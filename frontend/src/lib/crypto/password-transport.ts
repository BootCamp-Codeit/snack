/**
 * 로그인/회원가입 등 비밀번호 전송용 클라이언트 암호화.
 *
 * - `NEXT_PUBLIC_AUTH_LOGIN_RSA_PUBLIC_KEY_PEM` 이 있으면: RSA-OAEP(SHA-256)로 암호화 후 Base64 문자열을 `password` 필드에 넣습니다.
 * - 없으면: 기존과 동일하게 평문 전송(HTTPS로 전송 구간은 이미 TLS로 보호됨).
 *
 * 암호화를 쓰는 경우 **백엔드가 동일 키쌍의 비밀키로 복호화**한 뒤 기존처럼 검증해야 합니다.
 */

function getRsaPublicKeyPem(): string | null {
  const raw = process.env.NEXT_PUBLIC_AUTH_LOGIN_RSA_PUBLIC_KEY_PEM;
  if (!raw?.trim()) return null;
  return raw.replace(/\\n/g, "\n").trim();
}

function pemSpkiToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/**
 * 공개키가 설정된 경우에만 RSA-OAEP 암호화. 2048비트 키·SHA-256 기준 평문 상한은 약 190바이트(UTF-8)입니다.
 */
export async function encryptPasswordForTransportIfConfigured(
  plainPassword: string
): Promise<string> {
  const pem = getRsaPublicKeyPem();
  if (!pem) {
    return plainPassword;
  }

  if (typeof globalThis.crypto?.subtle === "undefined") {
    throw new Error("이 환경에서는 Web Crypto API를 사용할 수 없습니다.");
  }

  const key = await crypto.subtle.importKey(
    "spki",
    pemSpkiToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const data = new TextEncoder().encode(plainPassword);
  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    data
  );

  return arrayBufferToBase64(encrypted);
}

export function isPasswordRsaTransportEnabled(): boolean {
  return Boolean(getRsaPublicKeyPem());
}
