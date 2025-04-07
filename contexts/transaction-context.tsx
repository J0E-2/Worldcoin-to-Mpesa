"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type TransactionStatus = "completed" | "pending" | "failed"

export interface Transaction {
  id: string
  type: "withdrawal" | "conversion"
  title: string
  amount: string
  timestamp: Date
  status: TransactionStatus
  description?: string
  icon: "arrowUpRight" | "refreshCw" | "clock"
  kesAmount?: number
}

interface TransactionContextType {
  transactions: Transaction[]
  balance: number
  setBalance: (balance: number) => void
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void
  updateTransactionStatus: (id: string, status: TransactionStatus) => void
  clearTransactions: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState(12.45) // Initial balance

  // Load transactions from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTransactions = localStorage.getItem("wld_transactions")
      const savedBalance = localStorage.getItem("wld_balance")

      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions)
          // Convert string timestamps back to Date objects
          const formattedTransactions = parsedTransactions.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }))
          setTransactions(formattedTransactions)
        } catch (error) {
          console.error("Error parsing saved transactions:", error)
        }
      }

      if (savedBalance) {
        try {
          setBalance(Number.parseFloat(savedBalance))
        } catch (error) {
          console.error("Error parsing saved balance:", error)
        }
      }
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wld_transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  // Save balance to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wld_balance", balance.toString())
    }
  }, [balance])

  const addTransaction = (transaction: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    }

    setTransactions((prev) => [newTransaction, ...prev])

    // Update balance based on transaction type
    if (transaction.type === "withdrawal") {
      const amount = Number.parseFloat(transaction.amount.replace("-", ""))
      setBalance((prev) => Number.parseFloat((prev - amount).toFixed(4)))
    }
  }

  const updateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, status } : tx)))
  }

  const clearTransactions = () => {
    setTransactions([])
    setBalance(12.45)
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        balance,
        setBalance,
        addTransaction,
        updateTransactionStatus,
        clearTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}

