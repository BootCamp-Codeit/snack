import { NextResponse } from "next/server";

import { API_BASE_URL } from "@/lib/env";

/**
 * 브라우저 → Next(동일 출처) → 백엔드 로그인 프록시
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

  const upstream = await fetch(`${API_BASE_URL}/api/auth/login`, {
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
