import { type NextRequest, NextResponse } from "next/server"
import { initiateSTKPush } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, reference, description } = await request.json()

    if (!phoneNumber || !amount) {
      return NextResponse.json({ success: false, error: "Phone number and amount are required" }, { status: 400 })
    }

    const result = await initiateSTKPush(
      phoneNumber,
      amount,
      reference || "WLD2MPESA",
      description || "Worldcoin to M-Pesa conversion",
    )

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestID: result.checkoutRequestID,
        customerMessage: result.customerMessage,
      },
    })
  } catch (error) {
    console.error("Error initiating M-Pesa payment:", error)
    return NextResponse.json({ success: false, error: "Failed to initiate payment" }, { status: 500 })
  }
}

