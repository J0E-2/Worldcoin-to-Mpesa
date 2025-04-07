import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
  // Generate a random nonce (at least 8 alphanumeric characters)
  const nonce = crypto.randomUUID().replace(/-/g, "")

  // Store the nonce in a cookie
  cookies().set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return NextResponse.json({ nonce })
}

