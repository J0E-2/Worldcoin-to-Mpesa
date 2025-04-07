"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { MiniKitFallback } from "@/lib/minikit-fallback"
import { getAuthState, clearAuthState, storeAuthState } from "@/lib/world-id"
import { useToast } from "@/components/ui/use-toast"

// Dynamically import MiniKit to handle the case when it's not installed
let MiniKit: any

// Initialize MiniKit
async function initMiniKit() {
  if (!MiniKit) {
    try {
      const module = await import("@worldcoin/minikit-js")
      MiniKit = module.MiniKit
    } catch (error) {
      console.warn("Failed to load MiniKit, using fallback implementation")
      MiniKit = MiniKitFallback
    }
  }
  return MiniKit
}

interface AuthContextType {
  isLoggedIn: boolean
  userInfo: {
    nullifier_hash?: string
    credential_type?: string
    username?: string
    walletAddress?: string
  } | null
  login: () => Promise<void>
  logout: () => void
  isLoading: boolean
  isWorldApp: boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userInfo: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  isWorldApp: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isWorldApp, setIsWorldApp] = useState(false)
  const [userInfo, setUserInfo] = useState<{
    nullifier_hash?: string
    credential_type?: string
    username?: string
    walletAddress?: string
  } | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Handle server-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if we're running inside World App
  useEffect(() => {
    if (!isClient) return

    const checkWorldApp = async () => {
      const MiniKit = await initMiniKit()
      setIsWorldApp(MiniKit.isInstalled())
    }

    checkWorldApp()
  }, [isClient])

  useEffect(() => {
    // Only check authentication on the client side
    if (!isClient) return

    // Check authentication on mount and when pathname changes
    const checkAuth = () => {
      try {
        const authState = getAuthState()

        if (authState && authState.verified) {
          setIsLoggedIn(true)
          setUserInfo({
            nullifier_hash: authState.nullifier_hash,
            credential_type: authState.credential_type,
            username: authState.username,
            walletAddress: authState.walletAddress,
          })
        } else {
          setIsLoggedIn(false)
          setUserInfo(null)
        }
      } catch (e) {
        setIsLoggedIn(false)
        setUserInfo(null)
      }
    }

    checkAuth()
  }, [pathname, isClient])

  const login = async () => {
    setIsLoading(true)

    try {
      const MiniKit = await initMiniKit()

      // Check if MiniKit is installed (running inside World App)
      if (!MiniKit.isInstalled()) {
        // Fallback to mock authentication for testing
        console.warn("Not running inside World App, using mock authentication")

        // Store mock authentication state
        const mockWalletAddress = `0x${Math.random().toString(36).substring(2, 10)}`
        storeAuthState({
          verified: true,
          nullifier_hash: mockWalletAddress,
          credential_type: "wallet",
          username: "test_user",
          walletAddress: mockWalletAddress,
        })

        setIsLoggedIn(true)
        setUserInfo({
          nullifier_hash: mockWalletAddress,
          credential_type: "wallet",
          username: "test_user",
          walletAddress: mockWalletAddress,
        })

        toast({
          title: "Mock authentication successful",
          description: "You have been signed in with a mock account for testing",
        })

        router.push("/dashboard")
        return
      }

      // Get nonce from backend
      const res = await fetch("/api/nonce")
      const { nonce } = await res.json()

      // Request wallet auth
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        statement: "Sign in to WLD2M-Pesa to access your wallet",
      })

      if (finalPayload.status === "error") {
        throw new Error(finalPayload.error_code || "Authentication failed")
      }

      // Verify the signature on the backend
      const verifyResponse = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.isValid) {
        throw new Error("Signature verification failed")
      }

      // Get username and wallet address from MiniKit
      const username = MiniKit.user?.username
      const walletAddress = finalPayload.address

      // Store auth state
      storeAuthState({
        verified: true,
        nullifier_hash: walletAddress,
        credential_type: "wallet",
        username,
        walletAddress,
      })

      setIsLoggedIn(true)
      setUserInfo({
        nullifier_hash: walletAddress,
        credential_type: "wallet",
        username,
        walletAddress,
      })

      toast({
        title: "Authentication successful",
        description: "You have been successfully signed in",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error during authentication:", error)
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with World App",
      })
      setIsLoggedIn(false)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearAuthState()
    setIsLoggedIn(false)
    setUserInfo(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userInfo, login, logout, isLoading, isWorldApp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

