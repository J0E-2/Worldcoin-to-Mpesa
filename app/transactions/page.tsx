"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { TransactionItem } from "@/components/transaction-item"
import { useTransactions } from "@/contexts/transaction-context"

export default function TransactionsPage() {
  const { transactions } = useTransactions()
  const [filter, setFilter] = useState("all")

  // Filter transactions based on the selected tab
  const filteredTransactions = filter === "all" ? transactions : transactions.filter((tx) => tx.type === "withdrawal")

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-1 overflow-auto pt-16 p-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="px-4 py-3 flex flex-row items-center space-y-0">
            <Button variant="ghost" size="icon" asChild className="mr-2 h-8 w-8">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <CardTitle className="text-lg">Transaction History</CardTitle>
          </CardHeader>

          <div className="px-4 pb-2">
            <Tabs defaultValue="all" onValueChange={setFilter}>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <CardContent className="px-4 py-2 space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Your transactions will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

