"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./auth-provider"
import { useSettings } from "../settings/settings-provider"
import { motion } from "framer-motion"
import { FrostedCard } from "../ui/frosted-card"
import { useToast } from "@/hooks/use-toast"
import { Lock, Shield } from "lucide-react"

export function LoginForm() {
  const { login } = useAuth()
  const { settings } = useSettings()
  const { toast } = useToast()
  const [authCode, setAuthCode] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [step, setStep] = useState<"auth" | "2fa">("auth")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (step === "auth") {
      // If 2FA is enabled, move to the next step
      if (settings.twoFactorEnabled) {
        if (authCode === settings.authCode) {
          setStep("2fa")
          setIsLoading(false)
          return
        } else {
          toast({
            title: "授权失败",
            description: "授权码不正确",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      // Otherwise, attempt to login directly
      const success = login(authCode)
      if (!success) {
        toast({
          title: "授权失败",
          description: "授权码不正确",
          variant: "destructive",
        })
      }
    } else if (step === "2fa") {
      // Attempt to login with 2FA
      const success = login(authCode, twoFactorCode)
      if (!success) {
        toast({
          title: "验证失败",
          description: "两步验证码不正确",
          variant: "destructive",
        })
      }
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-background/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <FrostedCard className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">GitHub 图床</h1>
            <p className="text-muted-foreground mt-2">请输入授权码访问</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === "auth" ? (
              <div className="space-y-2">
                <Label htmlFor="auth-code" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  授权码
                </Label>
                <Input
                  id="auth-code"
                  type="password"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="请输入授权码"
                  required
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="two-factor-code" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  两步验证码
                </Label>
                <Input
                  id="two-factor-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">请打开您的身份验证器应用，输入显示的6位验证码</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "验证中..." : step === "auth" ? "验证授权码" : "验证"}
            </Button>

            {step === "2fa" && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep("auth")}
                disabled={isLoading}
              >
                返回
              </Button>
            )}
          </form>
        </FrostedCard>
      </motion.div>
    </div>
  )
}
