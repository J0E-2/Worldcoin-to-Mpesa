"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, RefreshCw, EyeOff, Eye } from "lucide-react"
import Link from "next/link"

interface BalanceCardProps {
  balance: number
  exchangeRate: number | null
  isRefreshing: boolean
  onRefresh: () => void
}

export function BalanceCard({ balance, exchangeRate, isRefreshing, onRefresh }: BalanceCardProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden)
  }

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-medium text-emerald-100">Your Balance</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleBalanceVisibility}
              className="h-7 w-7 text-emerald-100 hover:text-white hover:bg-emerald-600/30"
            >
              {isBalanceHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="sr-only">{isBalanceHidden ? "Show balance" : "Hide balance"}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 text-emerald-100 hover:text-white hover:bg-emerald-600/30"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh balance</span>
            </Button>
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-1">
          <div className="text-3xl font-bold">{isBalanceHidden ? "••••••" : balance.toFixed(2)}</div>
          <div className="text-lg text-emerald-100">WLD</div>
        </div>

        {exchangeRate && (
          <div className="text-sm text-emerald-100 mb-3">
            ≈ {isBalanceHidden ? "••••••" : (balance * exchangeRate).toLocaleString()} KES
          </div>
        )}

        <Button asChild size="sm" className="w-full bg-white text-emerald-700 hover:bg-emerald-50">
          <Link href="/withdraw">
            Withdraw to M-Pesa
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

