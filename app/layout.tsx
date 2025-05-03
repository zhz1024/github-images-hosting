import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { BackgroundEffect } from "@/components/background-effect"
import { SettingsProvider } from "@/components/settings/settings-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { AuthGate } from "@/components/auth/auth-gate"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GitHub 图床",
  description: "基于GitHub的图床系统，支持上传、下载和链接管理",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SettingsProvider>
            <AuthProvider>
              <BackgroundEffect />
              <div className="relative z-10">
                <AuthGate>{children}</AuthGate>
                <Toaster />
              </div>
            </AuthProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
