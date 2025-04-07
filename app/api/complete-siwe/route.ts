import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { verifySiweMessage } from "@/lib/world-id"
import type { MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

export async function POST(req: NextRequest) {
  const { payload, nonce } = (await req.json()) as IRequestPayload

  // Verify the nonce matches what we stored in the cookie
  const storedNonce = cookies().get("siwe")?.value

  if (nonce !== storedNonce) {
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: "Invalid nonce",
      },
      { status: 400 },
    )
  }

  try {
    const validMessage = await verifySiweMessage(payload, nonce)

    // Clear the nonce cookie after verification
    cookies().delete("siwe")

    return NextResponse.json({
      status: "success",
      isValid: validMessage.isValid,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: error.message,
      },
      { status: 500 },
    )
  }
}

