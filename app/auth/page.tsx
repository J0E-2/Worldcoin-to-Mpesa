"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const { login, isLoading, isWorldApp } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>Sign in with World ID to access your WLD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center justify-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <p className="text-sm font-medium">Secure World ID Verification</p>
              </div>
              <p className="mt-2 text-center text-xs text-gray-500">
                Sign in with World ID to securely access your wallet and funds
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-500">By connecting, the app will:</p>
              <ul className="list-inside list-disc space-y-1 text-gray-500">
                <li>Access your WLD balance</li>
                <li>View your transaction history</li>
                <li>Request withdrawals (with your approval)</li>
              </ul>
            </div>

            <div className="space-y-2">
              {!isWorldApp && (
                <p className="text-amber-600 text-xs text-center">
                  For the best experience, please open this app from within the World App
                </p>
              )}

              <Button onClick={login} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with World ID"
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 mt-2">
                Having trouble? Try refreshing the page or using a different browser.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

