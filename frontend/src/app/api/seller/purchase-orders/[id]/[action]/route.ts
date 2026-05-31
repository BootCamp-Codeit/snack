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

type RouteContext = {
  params: Promise<{ id: string; action: string }>
}

function normalizeAction(raw: string): "approve" | "reject" | "record-purchase" | null {
  const a = raw.trim().toLowerCase()
  if (a === "approve" || a === "reject" || a === "record-purchase") return a
  return null
}

/**
 * 백엔드 프록시:
 * - POST /api/seller/purchase-orders/:id/approve
 * - POST /api/seller/purchase-orders/:id/reject
 * - POST /api/seller/purchase-orders/:id/record-purchase
 */
export async function POST(req: Request, ctx: RouteContext) {
  const { id, action } = await ctx.params
  const normalizedAction = normalizeAction(action)
  if (!normalizedAction) {
    return NextResponse.json(
      { success: false, message: "지원하지 않는 액션입니다." },
      { status: 404 },
    )
  }

  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    )
  }

  const upstream = await fetch(
    `${API_BASE_URL}/api/seller/purchase-orders/${encodeURIComponent(id)}/${normalizedAction}`,
    {
      method: "POST",
      headers: buildHeaders(req),
      body,
    },
  )

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
