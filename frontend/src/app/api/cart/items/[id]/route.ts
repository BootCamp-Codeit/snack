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

type RouteContext = { params: Promise<{ id: string }> }

/** 백엔드 `PATCH /api/cart/items/:id` */
export async function PATCH(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    )
  }

  const upstream = await fetch(`${API_BASE_URL}/api/cart/items/${encodeURIComponent(id)}`, {
    method: "PATCH",
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

/** 백엔드 `DELETE /api/cart/items/:id` */
export async function DELETE(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  const upstream = await fetch(`${API_BASE_URL}/api/cart/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildHeaders(req),
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
