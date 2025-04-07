"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Give the auth context time to initialize
    const timer = setTimeout(() => {
      setIsChecking(false)
      if (!isLoggedIn) {
        router.push("/auth")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isLoggedIn, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 rounded-full border-t-transparent"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}

