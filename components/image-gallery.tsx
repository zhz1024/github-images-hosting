"use client"

import { useState, useEffect } from "react"
import { FrostedCard } from "@/components/ui/frosted-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, ExternalLink, Trash2, RefreshCw, Folder } from "lucide-react"
import { getImages, deleteImage } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import type { ImageItem } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "@/components/settings/settings-provider"

export function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { toast } = useToast()
  const { settings } = useSettings()

  const fetchImages = async () => {
    try {
      setLoading(true)
      const fetchedImages = await getImages()
      setImages(fetchedImages)
    } catch (error) {
      toast({
        title: "获取图片失败",
        description: error instanceof Error ? error.message : "获取图片列表时出错",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleCopyLink = (url: string, type: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "已复制",
      description: `${type}链接已复制到剪贴板`,
    })
  }

  const handleDelete = async (path: string) => {
    if (!confirm("确定要删除这张图片吗？")) return

    try {
      await deleteImage(path)
      toast({
        title: "删除成功",
        description: "图片已从GitHub仓库中删除",
      })

      // Refresh the image list
      fetchImages()

      // Clear selection if the deleted image was selected
      if (selectedImage && selectedImage.path === path) {
        setSelectedImage(null)
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "删除图片时出错",
        variant: "destructive",
      })
    }
  }

  // Get all available categories from images
  const categories = Array.from(new Set(images.map((image) => image.category || "未分类")))

  // Filter images based on search query and selected category
  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === null ||
      (selectedCategory === "未分类" && !image.category) ||
      image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Animation properties based on settings
  const getMotionProps = (index: number) => {
    if (!settings.enableAnimations) return {}

    const duration = settings.animationSpeed === "slow" ? 0.7 : settings.animationSpeed === "fast" ? 0.3 : 0.5

    const delay = settings.animationSpeed === "slow" ? 0.08 : settings.animationSpeed === "fast" ? 0.02 : 0.05

    return {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration, delay: index * delay },
      whileHover: { scale: 1.03 },
      layout: true,
    }
  }

  return (
    <div className="grid gap-6">
      <FrostedCard className="p-6">
        <div className="space-y-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">图片库</h2>
            <Button variant="outline" size="sm" onClick={fetchImages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>

          <div className="grid gap-2">
            <div className="relative">
              <Input
                placeholder="搜索图片..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchQuery("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                  <span className="sr-only">清除搜索</span>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="text-xs h-7"
              >
                全部
              </Button>

              {categories.map((category) => (
                <motion.div key={category} whileHover={settings.enableAnimations ? { y: -2 } : {}}>
                  <Button
                    size="sm"
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs h-7"
                  >
                    <Folder className="h-3 w-3 mr-1" />
                    {category}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>暂无图片，请上传图片到GitHub仓库</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>没有找到匹配的图片</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory(null)
              }}
            >
              清除筛选
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.path}
                  className={`
                    relative overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800
                    ${selectedImage?.path === image.path ? "ring-2 ring-primary" : ""}
                  `}
                  onClick={() => setSelectedImage(image)}
                  {...getMotionProps(index)}
                >
                  <img
                    src={image.download_url || "/placeholder.svg"}
                    alt={image.name}
                    className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(image.path)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2 text-xs truncate">
                    {image.name}
                    {image.category && (
                      <motion.span
                        className="ml-1 inline-flex items-center px-1 py-0.5 rounded text-xs bg-primary/10 text-primary-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {image.category}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </FrostedCard>

      {selectedImage && (
        <FrostedCard className="p-6">
          <h2 className="text-xl font-semibold mb-4">图片详情</h2>

          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={selectedImage.download_url || "/placeholder.svg"}
              alt={selectedImage.name}
              className="max-h-[300px] mx-auto object-contain rounded-md"
            />
          </motion.div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">文件名</p>
              <p className="text-sm text-muted-foreground">{selectedImage.name}</p>
              {selectedImage.category && (
                <div className="mt-1">
                  <span className="text-sm font-medium">分类: </span>
                  <span className="text-sm text-muted-foreground">{selectedImage.category}</span>
                </div>
              )}
            </div>

            <Tabs defaultValue="direct">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="direct">直接链接</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="space-y-2">
                <div className="flex">
                  <Input value={selectedImage.download_url} readOnly className="rounded-r-none" />
                  <Button
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={() => handleCopyLink(selectedImage.download_url, "直接")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="markdown" className="space-y-2">
                <div className="flex">
                  <Input
                    value={`![${selectedImage.name}](${selectedImage.download_url})`}
                    readOnly
                    className="rounded-r-none"
                  />
                  <Button
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={() =>
                      handleCopyLink(`![${selectedImage.name}](${selectedImage.download_url})`, "Markdown")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="html" className="space-y-2">
                <div className="flex">
                  <Input
                    value={`<img src="${selectedImage.download_url}" alt="${selectedImage.name}" />`}
                    readOnly
                    className="rounded-r-none"
                  />
                  <Button
                    variant="secondary"
                    className="rounded-l-none"
                    onClick={() =>
                      handleCopyLink(`<img src="${selectedImage.download_url}" alt="${selectedImage.name}" />`, "HTML")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.open(selectedImage.download_url, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                在新窗口打开
              </Button>
            </div>
          </div>
        </FrostedCard>
      )}
    </div>
  )
}
