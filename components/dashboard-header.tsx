"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, LogOut, Settings, User, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function DashboardHeader() {
  const { logout, userInfo } = useAuth()

  // Determine verification type
  const verificationType = userInfo?.credential_type === "orb" ? "Orb Verified" : "Phone Verified"

  return (
    <header className="fixed top-0 left-0 right-0 z-10 border-b bg-white h-16">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 p-1">
            <div className="h-5 w-5 rounded-full bg-emerald-600" />
          </div>
          <span className="font-bold text-emerald-900">WLD2M-Pesa</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 flex items-center gap-2 px-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" alt="User" />
                  <AvatarFallback>WD</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-xs">{verificationType}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

