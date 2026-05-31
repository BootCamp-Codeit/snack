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

/** 백엔드 `GET /api/seller/purchase-orders` 프록시 */
export async function GET(req: Request) {
  const incoming = new URL(req.url)
  const query = incoming.searchParams.toString()
  const upstreamUrl = `${API_BASE_URL}/api/seller/purchase-orders${query ? `?${query}` : ""}`

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: buildHeaders(req),
    })

    const text = await upstream.text()
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    })
  } catch (err) {
    console.error("[api/seller/purchase-orders] upstream fetch failed", upstreamUrl, err)
    return NextResponse.json(
      { success: false, message: "백엔드에 연결하지 못했습니다." },
      { status: 502 },
    )
  }
}
