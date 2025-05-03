"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Settings } from "lucide-react"
import { SettingsDrawer } from "@/components/settings/settings-drawer"
import { motion } from "framer-motion"
import { useSettings } from "@/components/settings/settings-provider"

export function Header() {
  const [showSettings, setShowSettings] = useState(false)
  const { settings } = useSettings()

  const getMotionProps = () => {
    if (!settings.enableAnimations) return {}

    const duration = settings.animationSpeed === "slow" ? 0.7 : settings.animationSpeed === "fast" ? 0.3 : 0.5

    return {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration },
    }
  }

  return (
    <motion.header className="flex justify-between items-center mb-8" {...getMotionProps()}>
      <motion.h1
        className="text-3xl font-bold"
        whileHover={settings.enableAnimations ? { scale: 1.05 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        GitHub 图床
      </motion.h1>

      <div className="flex items-center space-x-2">
        <ThemeSwitcher />
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="relative w-9 h-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">设置</span>
        </Button>
      </div>

      <SettingsDrawer open={showSettings} onOpenChange={setShowSettings} />
    </motion.header>
  )
}
