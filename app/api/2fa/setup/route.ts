import { type NextRequest, NextResponse } from "next/server"
import { generateSecret, generateQRCode, generateBackupCodes, hashBackupCode } from "@/lib/two-factor"

export async function POST(request: NextRequest) {
  try {
    const { userId, username } = await request.json()

    if (!userId || !username) {
      return NextResponse.json({ success: false, error: "User ID and username are required" }, { status: 400 })
    }

    // Generate 2FA secret
    const secret = generateSecret(userId)

    // Generate QR code
    const qrCodeUrl = await generateQRCode(username, "WLD2MPESA", secret)

    // Generate backup codes
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = backupCodes.map(hashBackupCode)

    // Store secret and hashed backup codes in your database
    // Associated with the user's account

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qrCodeUrl,
        backupCodes,
      },
    })
  } catch (error) {
    console.error("Error setting up 2FA:", error)
    return NextResponse.json({ success: false, error: "Failed to set up 2FA" }, { status: 500 })
  }
}

