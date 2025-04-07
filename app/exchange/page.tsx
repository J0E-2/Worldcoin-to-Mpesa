"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowDown, RefreshCw, Info } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { Separator } from "@/components/ui/separator"
import { useTransactions } from "@/contexts/transaction-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ExchangePage() {
  const { balance } = useTransactions()
  const [wldAmount, setWldAmount] = useState("")
  const [kesAmount, setKesAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(3000)
  const [isLoading, setIsLoading] = useState(false)
  const [direction, setDirection] = useState<"wldToKes" | "kesToWld">("wldToKes")

  // Fee percentage
  const feePercentage = 0.01 // 1%

  // Calculate amounts
  const wldValue = Number.parseFloat(wldAmount) || 0
  const kesValue = Number.parseFloat(kesAmount) || 0

  // Calculate fee and net amount
  const feeAmountWLD = wldValue * feePercentage
  const netWldAmount = wldValue - feeAmountWLD
  const netKesAmount = netWldAmount * exchangeRate

  // Update KES amount when WLD amount changes
  useEffect(() => {
    if (direction === "wldToKes") {
      const amount = Number.parseFloat(wldAmount) || 0
      setKesAmount((amount * exchangeRate).toString())
    }
  }, [wldAmount, exchangeRate, direction])

  // Update WLD amount when KES amount changes
  useEffect(() => {
    if (direction === "kesToWld") {
      const amount = Number.parseFloat(kesAmount) || 0
      setWldAmount((amount / exchangeRate).toFixed(4))
    }
  }, [kesAmount, exchangeRate, direction])

  const handleWldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirection("wldToKes")
    setWldAmount(e.target.value)
  }

  const handleKesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirection("kesToWld")
    setKesAmount(e.target.value)
  }

  const refreshRates = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Slightly change the rate to simulate a refresh
      setExchangeRate(3000 + Math.floor(Math.random() * 100))
    } catch (error) {
      console.error("Error fetching rates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 overflow-auto pt-16 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0">
            <Button variant="ghost" size="icon" asChild className="mr-2 h-8 w-8">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <CardTitle className="text-lg">Exchange Calculator</CardTitle>
            <Button variant="ghost" size="icon" onClick={refreshRates} disabled={isLoading} className="ml-auto h-8 w-8">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh rates</span>
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-5">
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span>Current Exchange Rate:</span>
                <span>1 WLD = {exchangeRate.toLocaleString()} KES</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Rates are updated every 5 minutes. Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wld-amount">WLD Amount</Label>
              <Input id="wld-amount" type="number" placeholder="0.00" value={wldAmount} onChange={handleWldChange} />
              <p className="text-xs text-gray-500">Available: {balance.toFixed(2)} WLD</p>
            </div>

            <div className="flex justify-center">
              <div className="rounded-full bg-gray-100 p-2">
                <ArrowDown className="h-4 w-4 text-gray-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kes-amount">KES Amount (Gross)</Label>
              <Input id="kes-amount" type="number" placeholder="0.00" value={kesAmount} onChange={handleKesChange} />
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="text-sm font-medium text-amber-800">Transaction Summary</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-amber-800">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            A 1% fee is applied to all withdrawals. This fee covers transaction costs and network fees.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>WLD Amount:</span>
                    <span>{wldValue.toFixed(4)} WLD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee ({feePercentage * 100}%):</span>
                    <span>-{feeAmountWLD.toFixed(4)} WLD</span>
                  </div>
                  <Separator className="my-1 bg-amber-200" />
                  <div className="flex justify-between font-medium">
                    <span>Net WLD Amount:</span>
                    <span>{netWldAmount.toFixed(4)} WLD</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You'll Receive:</span>
                    <span>{netKesAmount.toLocaleString()} KES</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={wldValue <= 0 || wldValue > balance}
            >
              <Link href={`/withdraw?amount=${wldValue}`}>Proceed to Withdraw</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

