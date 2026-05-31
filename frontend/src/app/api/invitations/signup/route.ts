import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/env";

/**
 * 브라우저 → Next(동일 출처) → 백엔드 초대 가입 프록시
 * (직접 API 도메인 호출 시 캐시·확장 프로그램·구번들과 섞일 여지를 줄입니다.)
 */
export async function POST(req: Request) {
  let body: string;
  try {
    body = await req.text();
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 본문을 읽을 수 없습니다." },
      { status: 400 }
    );
  }

  const upstream = await fetch(`${API_BASE_URL}/api/invitations/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
