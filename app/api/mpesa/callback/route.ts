import { type NextRequest, NextResponse } from "next/server"
import { processMpesaCallback } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json()
    const result = processMpesaCallback(callbackData)

    if (!result.success) {
      console.error("M-Pesa callback processing failed:", result)
      // Still return 200 to M-Pesa to acknowledge receipt
      return NextResponse.json({ success: false })
    }

    // Store transaction details in your database here
    // Update user's transaction history

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error)
    // Still return 200 to M-Pesa to acknowledge receipt
    return NextResponse.json({ success: false })
  }
}

