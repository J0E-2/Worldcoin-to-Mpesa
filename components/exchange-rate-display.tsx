"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExchangeRateDisplayProps {
  className?: string
  onRatesLoaded?: (rates: {
    wldToUsd: number
    usdToKes: number
    wldToKes: number
  }) => void
}

export function ExchangeRateDisplay({ className, onRatesLoaded }: ExchangeRateDisplayProps) {
  const [rates, setRates] = useState<{
    wldToUsd: number
    usdToKes: number
    wldToKes: number
    lastUpdated: string
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRates = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/exchange-rates")

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates")
      }

      const { success, data } = await response.json()

      if (!success) {
        throw new Error("Failed to fetch exchange rates")
      }

      setRates({
        wldToUsd: data.wldToUsd,
        usdToKes: data.usdToKes,
        wldToKes: data.wldToKes,
        lastUpdated: new Date(data.lastUpdated).toLocaleTimeString(),
      })

      if (onRatesLoaded) {
        onRatesLoaded({
          wldToUsd: data.wldToUsd,
          usdToKes: data.usdToKes,
          wldToKes: data.wldToKes,
        })
      }
    } catch (err) {
      console.error("Error fetching exchange rates:", err)
      setError("Failed to fetch exchange rates")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()

    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Current Exchange Rates</h3>
          <Button variant="ghost" size="icon" onClick={fetchRates} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh rates</span>
          </Button>
        </div>

        {error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : isLoading && !rates ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : rates ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>1 WLD = ${rates.wldToUsd.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span>1 USD = {rates.usdToKes.toFixed(2)} KES</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>1 WLD = {rates.wldToKes.toFixed(2)} KES</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">Last updated: {rates.lastUpdated}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

