"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSettings } from "../settings/settings-provider"

interface AuthContextType {
  isAuthenticated: boolean
  login: (authCode: string, twoFactorCode?: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if authentication is required
  const authRequired = Boolean(settings.authCode)

  // On initial load, check if auth is required
  useEffect(() => {
    // If no auth code is set, auto-authenticate
    if (!authRequired) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [authRequired])

  const login = (authCode: string, twoFactorCode?: string): boolean => {
    // Verify auth code
    if (authCode !== settings.authCode) {
      return false
    }

    // If 2FA is enabled, verify the code
    if (settings.twoFactorEnabled) {
      if (!twoFactorCode) return false

      // In a real app, we would validate the TOTP code here
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(twoFactorCode)) {
        return false
      }
    }

    // Set authenticated state
    setIsAuthenticated(true)
    return true
  }

  const logout = () => {
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{!isLoading && children}</AuthContext.Provider>
  )
}
