"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { TransactionItem } from "@/components/transaction-item"
import { BalanceCard } from "@/components/balance-card"
import { QuickActions } from "@/components/quick-actions"
import { useTransactions } from "@/contexts/transaction-context"
import { getWLDBalance } from "@/lib/wallet-service"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { transactions, balance, setBalance } = useTransactions()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [exchangeRate, setExchangeRate] = useState<number | null>(3000)
  const { toast } = useToast()
  const { isWorldApp } = useAuth()

  const fetchBalance = async () => {
    setIsRefreshing(true)
    try {
      if (isWorldApp) {
        // Get real-time balance from World App
        const realBalance = await getWLDBalance()
        setBalance(realBalance)
      } else {
        // Use mock balance for testing outside World App
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      setExchangeRate(3000)

      toast({
        title: "Balance updated",
        description: "Your balance has been refreshed",
      })
    } catch (error) {
      console.error("Error fetching balance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update balance. Please try again.",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  // Filter transactions for each tab
  const recentTransactions = transactions.slice(0, 3)
  const withdrawalTransactions = transactions.filter((tx) => tx.type === "withdrawal").slice(0, 3)

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 overflow-hidden pt-16">
        <div className="h-full flex flex-col">
          {/* Balance Section */}
          <div className="px-4 py-3">
            <BalanceCard
              balance={balance}
              exchangeRate={exchangeRate}
              isRefreshing={isRefreshing}
              onRefresh={fetchBalance}
            />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2">
            <QuickActions />
          </div>

          {/* Transactions Section */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="recent" className="h-full flex flex-col">
              <div className="px-4 pt-1 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">Transactions</h2>
                  <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                    <Link href="/transactions">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <TabsContent value="recent" className="h-full mt-0 space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transactions yet</p>
                      <p className="text-sm mt-1">Your transactions will appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="withdrawals" className="h-full mt-0 space-y-3">
                  {withdrawalTransactions.length > 0 ? (
                    withdrawalTransactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No withdrawals yet</p>
                      <p className="text-sm mt-1">Your withdrawals will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

