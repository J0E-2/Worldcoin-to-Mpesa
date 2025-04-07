import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, verifyBackupCode } from "@/lib/two-factor"

export async function POST(request: NextRequest) {
  try {
    const { token, secret, backupCode, hashedBackupCodes } = await request.json()

    if (!token && !backupCode) {
      return NextResponse.json({ success: false, error: "Token or backup code is required" }, { status: 400 })
    }

    let isValid = false

    if (token && secret) {
      // Verify TOTP token
      isValid = verifyToken(token, secret)
    } else if (backupCode && hashedBackupCodes) {
      // Verify backup code
      isValid = verifyBackupCode(backupCode, hashedBackupCodes)

      // If valid, remove the used backup code from the database
      if (isValid) {
        // Remove the used backup code from your database
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying 2FA:", error)
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 })
  }
}

