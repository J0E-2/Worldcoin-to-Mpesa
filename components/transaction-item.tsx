import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, RefreshCw, Coins, Clock } from "lucide-react"
import type { Transaction } from "@/contexts/transaction-context"

interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { title, amount, timestamp, status, description, icon } = transaction

  const getIcon = () => {
    switch (icon) {
      case "arrowUpRight":
        return <ArrowUpRight className="h-4 w-4" />
      case "refreshCw":
        return <RefreshCw className="h-4 w-4" />
      case "coins":
        return <Coins className="h-4 w-4" />
      case "clock":
        return <Clock className="h-4 w-4" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date >= today) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else if (date >= yesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-white p-3 shadow-sm">
      <div className="mt-0.5 rounded-full bg-gray-100 p-2">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium truncate">{title}</h4>
          <Badge
            variant={status === "completed" ? "default" : status === "pending" ? "outline" : "destructive"}
            className={status === "completed" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <p className="text-xs text-gray-500">{formatDate(timestamp)}</p>
          <p className={`font-medium ${amount.startsWith("+") ? "text-emerald-600" : ""}`}>{amount}</p>
        </div>
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  )
}

