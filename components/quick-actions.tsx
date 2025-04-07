import { Button } from "@/components/ui/button"
import { ArrowUpRight, Settings } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        size="sm"
        asChild
        className="h-auto py-3 flex flex-col items-center justify-center bg-white border-gray-200 hover:bg-gray-50"
      >
        <Link href="/withdraw">
          <ArrowUpRight className="h-5 w-5 mb-1 text-emerald-600" />
          <span className="text-xs">Withdraw</span>
        </Link>
      </Button>

      <Button
        variant="outline"
        size="sm"
        asChild
        className="h-auto py-3 flex flex-col items-center justify-center bg-white border-gray-200 hover:bg-gray-50"
      >
        <Link href="/security/2fa">
          <Settings className="h-5 w-5 mb-1 text-gray-600" />
          <span className="text-xs">Settings</span>
        </Link>
      </Button>
    </div>
  )
}

