"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useSettings } from "@/components/settings/settings-provider"

export function BackgroundEffect() {
  const { settings } = useSettings()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Only show background if enabled in settings
  if (!settings.enableBackground) return null

  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {/* Background image if provided */}
      {settings.backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${settings.backgroundImageUrl})`,
            opacity: settings.backgroundOpacity * 0.8,
          }}
        />
      )}

      {/* Frosted glass overlay */}
      <div
        className="absolute inset-0 backdrop-blur-[100px] z-10"
        style={{
          background: settings.backgroundImageUrl
            ? `rgba(var(--background), ${0.7 - settings.backgroundOpacity * 0.3})`
            : `linear-gradient(to bottom right, rgba(var(--background), 0.8), rgba(var(--background), 0.95), rgba(var(--background), 0.8))`,
        }}
      />

      {/* Background bubbles - only show if no custom background image */}
      {!settings.backgroundImageUrl &&
        Array.from({ length: 6 }).map((_, i) => {
          const size = Math.random() * 300 + 100
          return (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20 dark:opacity-10 bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl"
              style={{
                width: size,
                height: size,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 2 === 0 ? "rgba(var(--primary), 0.15)" : "rgba(var(--secondary), 0.1)",
              }}
              animate={{
                x: [0, 30, 0, -20, 0],
                y: [0, -40, 20, 40, 0],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          )
        })}
    </div>
  )
}
