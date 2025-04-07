import { type NextRequest, NextResponse } from "next/server"
import { checkTransactionStatus } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const { checkoutRequestID } = await request.json()

    if (!checkoutRequestID) {
      return NextResponse.json({ success: false, error: "Checkout request ID is required" }, { status: 400 })
    }

    const result = await checkTransactionStatus(checkoutRequestID)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        resultCode: result.resultCode,
        resultDesc: result.resultDesc,
        isComplete: result.resultCode === 0,
      },
    })
  } catch (error) {
    console.error("Error checking transaction status:", error)
    return NextResponse.json({ success: false, error: "Failed to check transaction status" }, { status: 500 })
  }
}

