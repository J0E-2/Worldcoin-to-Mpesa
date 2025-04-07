import { authenticator } from "otplib"
import QRCode from "qrcode"
import crypto from "crypto"

// Generate a secret for 2FA
export function generateSecret(userId: string): string {
  return authenticator.generateSecret()
}

// Generate a QR code for 2FA setup
export async function generateQRCode(username: string, serviceName: string, secret: string): Promise<string> {
  try {
    const otpauth = authenticator.keyuri(username, serviceName, secret)
    return await QRCode.toDataURL(otpauth)
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

// Verify a 2FA token
export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch (error) {
    console.error("Error verifying token:", error)
    return false
  }
}

// Generate backup codes
export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = []

  for (let i = 0; i < count; i++) {
    // Generate a random 8-character code
    const code = crypto.randomBytes(4).toString("hex").toUpperCase()
    codes.push(code)
  }

  return codes
}

// Hash a backup code for storage
export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex")
}

// Verify a backup code
export function verifyBackupCode(providedCode: string, hashedCodes: string[]): boolean {
  const hashedProvidedCode = hashBackupCode(providedCode)
  return hashedCodes.includes(hashedProvidedCode)
}

