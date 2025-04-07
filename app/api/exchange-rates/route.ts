import { NextResponse } from "next/server"
import { getExchangeRates } from "@/lib/exchange-rates"

export async function GET() {
  try {
    const rates = await getExchangeRates()

    return NextResponse.json({
      success: true,
      data: rates,
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exchange rates",
      },
      { status: 500 },
    )
  }
}

