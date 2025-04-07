import type { VerifyReply } from "@worldcoin/idkit"
import type { MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js"

// World ID verification configuration
export const worldIdConfig = {
  action: process.env.NEXT_PUBLIC_WORLD_APP_ACTION || "wld-mpesa-auth",
  app_id: process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_d9300b8c4c7b78f8d6a5561c6d12c9e0",
  is_staging: !process.env.NEXT_PUBLIC_WORLD_APP_ID || process.env.NEXT_PUBLIC_WORLD_APP_ID.includes("staging"),
}

// Function to verify World ID proof with our backend
export async function verifyWorldIdProof(proof: VerifyReply): Promise<any> {
  try {
    console.log("Verifying proof:", proof)

    const response = await fetch("/api/world-id/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proof),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Verification failed:", data)
      throw new Error(data.error || "Verification failed")
    }

    return data
  } catch (error) {
    console.error("Error verifying World ID proof:", error)
    throw error
  }
}

// Store user authentication state
export function storeAuthState(data: {
  verified: boolean
  nullifier_hash?: string
  credential_type?: string
  username?: string
  walletAddress?: string
}) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "worldcoin_auth",
      JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }),
    )
  }
}

// Get user authentication state
export function getAuthState(): {
  verified: boolean
  nullifier_hash?: string
  credential_type?: string
  username?: string
  walletAddress?: string
  timestamp?: number
} | null {
  if (typeof window === "undefined") return null

  const authData = localStorage.getItem("worldcoin_auth")
  if (!authData) return null

  try {
    return JSON.parse(authData)
  } catch (e) {
    return null
  }
}

// Clear user authentication state
export function clearAuthState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("worldcoin_auth")
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const authState = getAuthState()
  if (!authState) return false

  // Check if auth is expired (24 hours)
  const now = Date.now()
  const authTime = authState.timestamp || 0
  const authExpired = now - authTime > 24 * 60 * 60 * 1000

  return authState.verified && !authExpired
}

// Verify SIWE message
export async function verifySiweMessage(
  payload: MiniAppWalletAuthSuccessPayload,
  nonce: string,
): Promise<{ isValid: boolean }> {
  try {
    // In a real implementation, you would verify the SIWE message here
    // For now, we'll just check that the nonce matches
    const messageRegex = new RegExp(`nonce: ${nonce}`)
    const isValid = messageRegex.test(payload.message)

    return { isValid }
  } catch (error) {
    console.error("Error verifying SIWE message:", error)
    return { isValid: false }
  }
}

