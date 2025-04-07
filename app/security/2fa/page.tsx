"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TwoFactorSetup } from "@/components/two-factor-setup"
import { useRouter } from "next/navigation"

export default function TwoFactorPage() {
  const router = useRouter()
  const [isSetupComplete, setIsSetupComplete] = useState(false)

  const handleSetupComplete = (isEnabled: boolean) => {
    setIsSetupComplete(true)

    // In a real app, you'd update the user's profile
    // For demo purposes, we'll just redirect after a delay
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto max-w-5xl p-4 pt-24">
        <div className="flex justify-center">
          <TwoFactorSetup userId="user-123" username="john.doe@example.com" onComplete={handleSetupComplete} />
        </div>
      </main>
    </div>
  )
}

