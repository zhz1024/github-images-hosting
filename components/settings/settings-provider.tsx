"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Settings {
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"
  enableBackground: boolean
  backgroundOpacity: number
  backgroundImageUrl: string | null
  authCode: string | null
  twoFactorEnabled: boolean
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
}

const defaultSettings: Settings = {
  enableAnimations: true,
  animationSpeed: "normal",
  enableBackground: true,
  backgroundOpacity: 0.2,
  backgroundImageUrl: null,
  authCode: null,
  twoFactorEnabled: false,
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  resetSettings: () => {},
})

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loaded, setLoaded] = useState(false)

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem("github-image-host-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
    setLoaded(true)
  }, [])

  // Save settings to local storage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("github-image-host-settings", JSON.stringify(settings))
    }
  }, [settings, loaded])

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>{children}</SettingsContext.Provider>
  )
}
