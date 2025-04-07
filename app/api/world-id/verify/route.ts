import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { proof, merkle_root, nullifier_hash, credential_type, action } = await request.json()

    // Validate that required parameters are present
    if (!proof || !merkle_root || !nullifier_hash) {
      return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 })
    }

    // Prepare verification request
    const verifyRes = await fetch("https://developer.worldcoin.org/api/v1/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action || process.env.NEXT_PUBLIC_WORLD_APP_ACTION,
        app_id: process.env.NEXT_PUBLIC_WORLD_APP_ID,
        nullifier_hash,
        proof,
        merkle_root,
        credential_type,
      }),
    })

    if (!verifyRes.ok) {
      const errorText = await verifyRes.text()
      console.error("Error verifying World ID proof:", errorText)
      return NextResponse.json({ success: false, error: "Invalid proof" }, { status: 400 })
    }

    const verifyData = await verifyRes.json()

    // Return success response with verification data
    return NextResponse.json({
      success: true,
      verified: true,
      nullifier_hash,
      credential_type,
    })
  } catch (error) {
    console.error("Error verifying World ID proof:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}

