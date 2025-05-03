"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "./settings-provider"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AuthSettings() {
  const { settings, updateSettings } = useSettings()
  const { toast } = useToast()
  const [authCode, setAuthCode] = useState(settings.authCode || "")
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")

  // Mock QR code for 2FA setup (in a real app, this would be generated)
  const mockQrCodeUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/GitHub-Image-Host:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub-Image-Host"

  const handleAuthCodeSave = () => {
    updateSettings({ authCode })
    toast({
      title: "授权码已保存",
      description: "您的授权码已成功更新",
    })
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (enabled) {
      setShowTwoFactorDialog(true)
    } else {
      updateSettings({ twoFactorEnabled: false })
      toast({
        title: "两步验证已禁用",
        description: "您的账户安全性已降低",
      })
    }
  }

  const handleTwoFactorConfirm = () => {
    // In a real app, we would validate the verification code here
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      updateSettings({ twoFactorEnabled: true })
      setShowTwoFactorDialog(false)
      setVerificationCode("")
      toast({
        title: "两步验证已启用",
        description: "您的账户现在受到两步验证的保护",
      })
    } else {
      toast({
        title: "验证码无效",
        description: "请输入有效的6位数字验证码",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">授权设置</h3>

        <div className="space-y-2">
          <Label htmlFor="auth-code">授权码</Label>
          <div className="flex space-x-2">
            <Input
              id="auth-code"
              type="password"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="输入授权码"
            />
            <Button onClick={handleAuthCodeSave}>保存</Button>
          </div>
          <p className="text-sm text-muted-foreground">授权码用于保护您的图床访问权限</p>
        </div>

        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">两步验证 (2FA)</Label>
              <p className="text-sm text-muted-foreground">启用两步验证以增强账户安全性</p>
            </div>
            <Switch id="two-factor" checked={settings.twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
          </div>
        </div>
      </div>

      <AlertDialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>设置两步验证</AlertDialogTitle>
            <AlertDialogDescription>
              使用您的身份验证器应用扫描下方二维码，然后输入生成的验证码以完成设置。
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="border border-border p-2 rounded-md bg-background">
              <img
                src={mockQrCodeUrl || "/placeholder.svg"}
                alt="Two-factor authentication QR code"
                className="w-48 h-48"
              />
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="verification-code">验证码</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="输入6位验证码"
                maxLength={6}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleTwoFactorConfirm}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
