import { NextResponse } from "next/server"

import { API_BASE_URL } from "@/lib/env"

function buildHeaders(req: Request): Headers {
  const headers = new Headers()
  const authorization = req.headers.get("authorization")
  if (authorization) headers.set("authorization", authorization)
  const organizationId = req.headers.get("x-organization-id")
  if (organizationId) headers.set("x-organization-id", organizationId)
  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)
  return headers
}

export async function GET(req: Request) {
  const incoming = new URL(req.url)
  const query = incoming.searchParams.toString()
  const upstreamUrl = `${API_BASE_URL}/api/expenses${query ? `?${query}` : ""}`
  const headers = buildHeaders(req)

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers,
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    console.error("[api/expenses] upstream fetch failed", upstreamUrl, err)
    return NextResponse.json(
      { success: false, message: "백엔드에 연결하지 못했습니다." },
      { status: 502 },
    )
  }
}

/** 백엔드 `POST /api/expenses` 프록시 */
export async function POST(req: Request) {
  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: "POST",
    headers: buildHeaders(req),
    body,
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
