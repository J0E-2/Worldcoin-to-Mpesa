"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IDKitWidget, type ISuccessResult } from "@worldcoin/idkit"
import { Button } from "@/components/ui/button"
import { worldIdConfig, verifyWorldIdProof, storeAuthState } from "@/lib/world-id"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface WorldIDButtonProps {
  className?: string
}

export function WorldIDButton({ className }: WorldIDButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (proof: ISuccessResult) => {
    setIsVerifying(true)
    setError(null)

    try {
      console.log("Received proof:", proof)

      const response = await verifyWorldIdProof(proof)

      if (response.success && response.verified) {
        // Store authentication state
        storeAuthState({
          verified: true,
          nullifier_hash: proof.nullifier_hash,
          credential_type: proof.credential_type,
        })

        toast({
          title: "Verification successful",
          description: "You have been successfully verified with World ID",
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Verification failed. Please try again.")
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: response.error || "Could not verify your World ID. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error during verification:", error)
      setError("An error occurred during verification.")
      toast({
        variant: "destructive",
        title: "Verification error",
        description:
          error instanceof Error ? error.message : "An error occurred during verification. Please try again.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <IDKitWidget
        app_id={worldIdConfig.app_id}
        action={worldIdConfig.action}
        onSuccess={handleVerify}
        handleVerify={handleVerify}
        credential_types={["orb", "phone"]}
        enableTelemetry
      >
        {({ open }) => (
          <Button onClick={open} disabled={isVerifying} className={className}>
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Sign in with World ID"
            )}
          </Button>
        )}
      </IDKitWidget>

      {worldIdConfig.is_staging && (
        <p className="text-amber-600 text-xs mt-2">Using staging World ID. For testing only.</p>
      )}
    </div>
  )
}

