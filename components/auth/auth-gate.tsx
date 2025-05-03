"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { LoginForm } from "./login-form"
import { useSettings } from "../settings/settings-provider"

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const { settings } = useSettings()

  // If no auth code is set or user is authenticated, show children
  if (!settings.authCode || isAuthenticated) {
    return <>{children}</>
  }

  // Otherwise show login form
  return <LoginForm />
}
