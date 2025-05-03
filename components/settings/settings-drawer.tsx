"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useSettings } from "./settings-provider"
import { motion } from "framer-motion"
import { AuthSettings } from "./auth-settings"

interface SettingsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDrawer({ open, onOpenChange }: SettingsDrawerProps) {
  const { settings, updateSettings, resetSettings } = useSettings()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <SheetHeader className="mb-6">
            <SheetTitle>设置</SheetTitle>
            <SheetDescription>自定义您的图床体验</SheetDescription>
          </SheetHeader>

          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="appearance">外观</TabsTrigger>
              <TabsTrigger value="background">背景</TabsTrigger>
              <TabsTrigger value="security">安全</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">动画效果</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations-toggle" className="cursor-pointer">
                    启用动画
                  </Label>
                  <Switch
                    id="animations-toggle"
                    checked={settings.enableAnimations}
                    onCheckedChange={(checked) => updateSettings({ enableAnimations: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>动画速度</Label>
                  <RadioGroup
                    value={settings.animationSpeed}
                    onValueChange={(value) => updateSettings({ animationSpeed: value as "slow" | "normal" | "fast" })}
                    className="flex flex-wrap gap-4"
                    disabled={!settings.enableAnimations}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="slow" id="speed-slow" />
                      <Label htmlFor="speed-slow" className="cursor-pointer">
                        慢速
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="speed-normal" />
                      <Label htmlFor="speed-normal" className="cursor-pointer">
                        正常
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fast" id="speed-fast" />
                      <Label htmlFor="speed-fast" className="cursor-pointer">
                        快速
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">背景设置</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="background-toggle" className="cursor-pointer">
                    启用背景效果
                  </Label>
                  <Switch
                    id="background-toggle"
                    checked={settings.enableBackground}
                    onCheckedChange={(checked) => updateSettings({ enableBackground: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="background-opacity">背景透明度</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(settings.backgroundOpacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    id="background-opacity"
                    disabled={!settings.enableBackground}
                    value={[settings.backgroundOpacity]}
                    min={0.1}
                    max={0.5}
                    step={0.05}
                    onValueChange={(value) => updateSettings({ backgroundOpacity: value[0] })}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="background-image">背景图片URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="background-image"
                      placeholder="输入图片URL"
                      value={settings.backgroundImageUrl || ""}
                      onChange={(e) => updateSettings({ backgroundImageUrl: e.target.value || null })}
                      disabled={!settings.enableBackground}
                    />
                    {settings.backgroundImageUrl && (
                      <Button
                        variant="outline"
                        onClick={() => updateSettings({ backgroundImageUrl: null })}
                        disabled={!settings.enableBackground}
                      >
                        清除
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">输入图片URL以设置自定义背景，背景将应用磨砂玻璃效果</p>
                </div>

                {settings.backgroundImageUrl && settings.enableBackground && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <img
                      src={settings.backgroundImageUrl || "/placeholder.svg"}
                      alt="Background preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=128&width=400"
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security">
              <AuthSettings />
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-6">
            <Button onClick={resetSettings} variant="outline">
              重置设置
            </Button>
            <SheetClose asChild>
              <Button>保存并关闭</Button>
            </SheetClose>
          </SheetFooter>
        </motion.div>
      </SheetContent>
    </Sheet>
  )
}
