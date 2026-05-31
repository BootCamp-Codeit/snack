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

function logAuthForward(meta: {
  method: string
  path: string
  hasIncomingAuthorization: boolean
  hasForwardAuthorization: boolean
  incomingOrganizationId: string | null
  forwardOrganizationId: string | null
}) {
  console.info("[budget-proxy] auth-forward-check", meta)
}

export async function GET(req: Request) {
  const incoming = new URL(req.url)
  const query = incoming.searchParams.toString()
  const upstreamUrl = `${API_BASE_URL}/api/budget/periods${query ? `?${query}` : ""}`
  const headers = buildHeaders(req)
  logAuthForward({
    method: "GET",
    path: `/api/budget/periods${query ? `?${query}` : ""}`,
    hasIncomingAuthorization: Boolean(req.headers.get("authorization")),
    hasForwardAuthorization: Boolean(headers.get("authorization")),
    incomingOrganizationId: req.headers.get("x-organization-id"),
    forwardOrganizationId: headers.get("x-organization-id"),
  })

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
}

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

  const headers = buildHeaders(req)
  logAuthForward({
    method: "POST",
    path: "/api/budget/periods",
    hasIncomingAuthorization: Boolean(req.headers.get("authorization")),
    hasForwardAuthorization: Boolean(headers.get("authorization")),
    incomingOrganizationId: req.headers.get("x-organization-id"),
    forwardOrganizationId: headers.get("x-organization-id"),
  })
  const upstream = await fetch(`${API_BASE_URL}/api/budget/periods`, {
    method: "POST",
    headers,
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

