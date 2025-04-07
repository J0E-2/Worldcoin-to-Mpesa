"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldCheck } from "lucide-react"
import Image from "next/image"

interface TwoFactorSetupProps {
  userId: string
  username: string
  onComplete: (isEnabled: boolean) => void
}

export function TwoFactorSetup({ userId, username, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"setup" | "verify" | "backup" | "complete">("setup")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")

  const setupTwoFactor = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, username }),
      })

      if (!response.ok) {
        throw new Error("Failed to set up 2FA")
      }

      const { success, data } = await response.json()

      if (!success) {
        throw new Error("Failed to set up 2FA")
      }

      setSecret(data.secret)
      setQrCode(data.qrCodeUrl)
      setBackupCodes(data.backupCodes)
      setStep("verify")
    } catch (err) {
      console.error("Error setting up 2FA:", err)
      setError("Failed to set up 2FA. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTwoFactor = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationCode, secret }),
      })

      if (!response.ok) {
        throw new Error("Invalid verification code")
      }

      const { success } = await response.json()

      if (!success) {
        throw new Error("Invalid verification code")
      }

      setStep("backup")
    } catch (err) {
      console.error("Error verifying 2FA:", err)
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const completeTwoFactorSetup = () => {
    setStep("complete")
    onComplete(true)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {step === "setup" && "Secure your account with 2FA"}
          {step === "verify" && "Verify your authenticator app"}
          {step === "backup" && "Save your backup codes"}
          {step === "complete" && "2FA setup complete"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "setup" && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                <p className="text-sm font-medium">Enhanced Security</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Two-factor authentication adds an extra layer of security to your account. You'll need to enter a code
                from your authenticator app in addition to your password.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">To set up 2FA, you'll need:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
                <li>An authenticator app like Google Authenticator or Authy</li>
                <li>A device to scan the QR code</li>
              </ul>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {qrCode && (
                <div className="border p-2 bg-white">
                  <Image src={qrCode || "/placeholder.svg"} alt="QR Code for 2FA" width={200} height={200} />
                </div>
              )}
            </div>

            <Tabs defaultValue="scan">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>
              <TabsContent value="scan" className="space-y-4">
                <p className="text-sm text-gray-500 mt-2">Scan this QR code with your authenticator app.</p>
              </TabsContent>
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secret">Secret Key</Label>
                  <Input id="secret" value={secret} readOnly onClick={(e) => e.currentTarget.select()} />
                  <p className="text-xs text-gray-500">
                    If you can't scan the QR code, enter this secret key manually in your authenticator app.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2 pt-4">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <p className="text-xs text-gray-500">Enter the 6-digit code from your authenticator app.</p>
            </div>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Save these backup codes in a secure place. You can use them to access your account if you lose your
              authenticator device.
            </p>

            <div className="rounded-lg border bg-gray-50 p-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">Each backup code can only be used once. Keep them safe and secure.</p>
          </div>
        )}

        {step === "complete" && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Setup Complete!</h3>
              <p className="text-sm text-gray-500 mt-1">Two-factor authentication has been enabled for your account.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {step === "setup" && (
          <Button onClick={setupTwoFactor} disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Set up 2FA"
            )}
          </Button>
        )}

        {step === "verify" && (
          <Button
            onClick={verifyTwoFactor}
            disabled={isLoading || !verificationCode}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>
        )}

        {step === "backup" && (
          <Button onClick={completeTwoFactorSetup} className="w-full bg-emerald-600 hover:bg-emerald-700">
            I've saved my backup codes
          </Button>
        )}

        {step === "complete" && (
          <Button onClick={() => onComplete(true)} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

