"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useTransactions } from "@/contexts/transaction-context"
import { initiateWithdrawal, checkTransactionStatus } from "@/lib/wallet-service"
import { useToast } from "@/components/ui/use-toast"

export default function WithdrawPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { balance, addTransaction } = useTransactions()
  const [amount, setAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [mpesaReference, setMpesaReference] = useState<string | null>(null)
  const { toast } = useToast()

  // Get amount from URL if provided
  useEffect(() => {
    const amountParam = searchParams.get("amount")
    if (amountParam) {
      setAmount(amountParam)
    }
  }, [searchParams])

  // Exchange rate
  const exchangeRate = 3000
  const feePercentage = 0.01 // 1%

  const wldAmount = Number.parseFloat(amount) || 0
  const feeAmount = wldAmount * feePercentage
  const netWldAmount = wldAmount - feeAmount
  const kesAmount = netWldAmount * exchangeRate

  const handleContinue = async () => {
    setError(null)

    if (step === 1) {
      if (!isStepOneValid) return
      setStep(2)
    } else if (step === 2) {
      if (!isStepTwoValid) return

      setIsProcessing(true)
      try {
        // Recipient address for the app's wallet
        const recipientAddress =
          process.env.NEXT_PUBLIC_APP_WALLET_ADDRESS || "0x377da9cab87c04a1d6f19d8b4be9aef8df26fcdd"

        // Initiate withdrawal using MiniKit
        const result = await initiateWithdrawal(wldAmount, recipientAddress)

        if (!result.success) {
          throw new Error(result.error || "Failed to process withdrawal")
        }

        // Generate transaction IDs
        const txId = result.transactionId || `WLD${Math.floor(Math.random() * 1000000)}`
        const mpesaRef = `QJH${Math.floor(Math.random() * 1000000)}`

        setTransactionId(txId)
        setMpesaReference(mpesaRef)

        // Check transaction status
        const txStatus = await checkTransactionStatus(txId)

        if (txStatus.status === "failed") {
          throw new Error("Transaction failed. Please try again.")
        }

        // Add withdrawal transaction
        addTransaction({
          type: "withdrawal",
          title: "Withdrawal to M-Pesa",
          amount: `-${wldAmount.toFixed(4)} WLD`,
          status: "completed",
          description: `To: +254 ${phoneNumber} • ${kesAmount.toLocaleString()} KES`,
          icon: "arrowUpRight",
          kesAmount: kesAmount,
        })

        // Initiate M-Pesa payment
        const mpesaResult = await fetch("/api/mpesa/initiate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: `254${phoneNumber}`,
            amount: kesAmount,
            reference: mpesaRef,
            description: "Worldcoin to M-Pesa conversion",
          }),
        })

        if (!mpesaResult.ok) {
          const errorData = await mpesaResult.json()
          throw new Error(errorData.error || "Failed to initiate M-Pesa payment")
        }

        toast({
          title: "Withdrawal successful",
          description: "Your funds are on the way to your M-Pesa account",
        })

        setStep(3)
      } catch (error) {
        console.error("Error processing withdrawal:", error)
        setError(error instanceof Error ? error.message : "Failed to process withdrawal. Please try again.")
        toast({
          variant: "destructive",
          title: "Withdrawal failed",
          description: error instanceof Error ? error.message : "Failed to process withdrawal",
        })
      } finally {
        setIsProcessing(false)
      }
    } else if (step === 3) {
      router.push("/dashboard")
    }
  }

  const isStepOneValid = wldAmount > 0 && wldAmount <= balance
  const isStepTwoValid = phoneNumber.length >= 10

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 overflow-auto pt-16 p-4">
        <Card className="max-w-md mx-auto">
          <div className="p-4 border-b flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2 h-8 w-8">
              <Link href={step === 1 ? "/dashboard" : ""} onClick={step > 1 ? () => setStep(step - 1) : undefined}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Withdraw to M-Pesa</h1>
              <p className="text-sm text-gray-500">
                {step === 1 && "Enter amount to withdraw"}
                {step === 2 && "Confirm withdrawal details"}
                {step === 3 && "Withdrawal successful"}
              </p>
            </div>
          </div>

          <CardContent className="p-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">WLD Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Available: {balance.toFixed(2)} WLD</p>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between text-sm">
                    <span>Exchange Rate:</span>
                    <span>1 WLD = {exchangeRate.toLocaleString()} KES</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Fee ({feePercentage * 100}%):</span>
                    <span>{feeAmount.toFixed(4)} WLD</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm font-medium">
                    <span>You'll receive:</span>
                    <span>{kesAmount.toLocaleString()} KES</span>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">M-Pesa Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center rounded-l-md border border-r-0 bg-gray-100 px-3 text-sm text-gray-500">
                      +254
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      className="rounded-l-none"
                      placeholder="712 345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>WLD Amount:</span>
                    <span>{wldAmount.toFixed(4)} WLD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee ({feePercentage * 100}%):</span>
                    <span>{feeAmount.toFixed(4)} WLD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Net WLD Amount:</span>
                    <span>{netWldAmount.toFixed(4)} WLD</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-medium">
                    <span>M-Pesa Amount:</span>
                    <span>{kesAmount.toLocaleString()} KES</span>
                  </div>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    You will receive an M-Pesa prompt on your phone to complete the transaction.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-6 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Withdrawal Successful!</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {kesAmount.toLocaleString()} KES has been sent to your M-Pesa
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Phone: +254 {phoneNumber}</p>
                </div>
                <div className="rounded-lg border bg-gray-50 p-4 text-left">
                  <div className="flex justify-between text-sm">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{transactionId}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>M-Pesa Reference:</span>
                    <span className="font-mono">{mpesaReference}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-0">
            {step === 1 && (
              <Button
                onClick={handleContinue}
                disabled={!isStepOneValid}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {step === 2 && (
              <Button
                onClick={handleContinue}
                disabled={!isStepTwoValid || isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm Withdrawal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleContinue} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Back to Dashboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

