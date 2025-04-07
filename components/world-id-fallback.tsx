"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { storeAuthState } from "@/lib/world-id"
import { useToast } from "@/components/ui/use-toast"

interface WorldIDFallbackProps {
  className?: string
}

export function WorldIDFallback({ className }: WorldIDFallbackProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleAuth = async () => {
    setIsVerifying(true)

    try {
      // Simulate World ID verification
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Store mock authentication state
      storeAuthState({
        verified: true,
        nullifier_hash: "mock_" + Math.random().toString(36).substring(2),
        credential_type: "phone",
      })

      toast({
        title: "Verification successful",
        description: "You have been successfully verified with World ID",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error during authentication:", error)
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: "Could not verify your World ID. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Button onClick={handleAuth} disabled={isVerifying} className={className}>
      {isVerifying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        "Sign in with World ID"
      )}
    </Button>
  )
}

