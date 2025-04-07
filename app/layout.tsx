import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { TransactionProvider } from "@/contexts/transaction-context"
import { Toaster } from "@/components/ui/toaster"
import MiniKitProvider from "@/components/minikit-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Worldcoin to M-Pesa",
  description: "Withdraw Worldcoin to M-Pesa",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MiniKitProvider>
            <AuthProvider>
              <TransactionProvider>
                {children}
                <Toaster />
              </TransactionProvider>
            </AuthProvider>
          </MiniKitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'