"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getCategories, createCategory } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { useSettings } from "@/components/settings/settings-provider"
import type { ImageCategory } from "@/lib/types"

interface CategorySelectorProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const { settings } = useSettings()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const fetchedCategories = await getCategories()
      setCategories(fetchedCategories)
    } catch (error) {
      toast({
        title: "获取分类失败",
        description: error instanceof Error ? error.message : "获取分类列表时出错",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "分类名不能为空",
        variant: "destructive",
      })
      return
    }

    try {
      setCreatingCategory(true)
      await createCategory(newCategoryName)

      toast({
        title: "创建分类成功",
        description: `已成功创建分类"${newCategoryName}"`,
      })

      await fetchCategories()
      setNewCategoryName("")
      setDialogOpen(false)
    } catch (error) {
      toast({
        title: "创建分类失败",
        description: error instanceof Error ? error.message : "创建分类时出错",
        variant: "destructive",
      })
    } finally {
      setCreatingCategory(false)
    }
  }

  const getMotionProps = () => {
    if (!settings.enableAnimations) return {}

    const duration = settings.animationSpeed === "slow" ? 0.7 : settings.animationSpeed === "fast" ? 0.3 : 0.5

    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration },
    }
  }

  if (loading) {
    return <div className="text-center py-3">加载分类中...</div>
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label>选择分类</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-1" />
              新建分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新分类</DialogTitle>
              <DialogDescription>输入新分类的名称，创建后可以在上传时选择该分类。</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="分类名称"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="button" onClick={handleCreateCategory} disabled={creatingCategory}>
                {creatingCategory ? "创建中..." : "创建分类"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <RadioGroup
        value={value || "default"}
        onValueChange={(val) => onChange(val === "default" ? null : val)}
        className="space-y-2"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="flex items-center space-x-3 rounded-md border border-neutral-200 dark:border-neutral-800 p-3"
            whileHover={settings.enableAnimations ? { scale: 1.02 } : {}}
            {...getMotionProps()}
            transition={{ delay: settings.enableAnimations ? index * 0.05 : 0 }}
          >
            <RadioGroupItem
              value={category.name === "未分类" ? "default" : category.name}
              id={`category-${category.id}`}
            />
            <Label htmlFor={`category-${category.id}`} className="flex-grow cursor-pointer">
              {category.name}
            </Label>
            {category.name !== "未分类" && (
              <span className="text-xs text-muted-foreground">{category.path.split("/").pop()}</span>
            )}
          </motion.div>
        ))}
      </RadioGroup>
    </div>
  )
}
