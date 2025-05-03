"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { useSettings } from "@/components/settings/settings-provider"
import { motion } from "framer-motion"

interface FrostedCardProps {
  children: ReactNode
  className?: string
}

export function FrostedCard({ children, className }: FrostedCardProps) {
  const { settings } = useSettings()

  // Animation properties based on settings
  const getMotionProps = () => {
    if (!settings.enableAnimations) return {}

    const duration = settings.animationSpeed === "slow" ? 0.7 : settings.animationSpeed === "fast" ? 0.3 : 0.5

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration },
    }
  }

  return (
    <motion.div
      className={cn(
        "rounded-xl border border-neutral-200/80 dark:border-neutral-800/80",
        "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md",
        "shadow-sm",
        className,
      )}
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      {...getMotionProps()}
    >
      {children}
    </motion.div>
  )
}
