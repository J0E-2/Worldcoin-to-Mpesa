"use client"

import { type ReactNode, useEffect, useState } from "react"
import { MiniKitFallback } from "@/lib/minikit-fallback"

// Dynamically import MiniKit to handle the case when it's not installed
let MiniKit: any

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Try to import MiniKit, use fallback if it fails
    const loadMiniKit = async () => {
      try {
        const module = await import("@worldcoin/minikit-js")
        MiniKit = module.MiniKit
      } catch (error) {
        console.warn("Failed to load MiniKit, using fallback implementation")
        MiniKit = MiniKitFallback
      }

      // Install MiniKit with your app ID
      const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID || "app_staging_d9300b8c4c7b78f8d6a5561c6d12c9e0"
      MiniKit.install(appId)

      // Check if we're running inside World App
      const isInWorldApp = MiniKit.isInstalled()
      console.log("Running inside World App:", isInWorldApp)

      setIsLoaded(true)
    }

    loadMiniKit()

    return () => {
      // Clean up any listeners if needed
    }
  }, [])

  if (!isLoaded) {
    return null // Or a loading indicator
  }

  return <>{children}</>
}

