"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FrostedCard } from "@/components/ui/frosted-card"
import { Upload, ImageIcon, X, Folder, File, AlertCircle } from "lucide-react"
import { uploadImage } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { CategorySelector } from "@/components/category-selector"
import { motion, AnimatePresence } from "framer-motion"
import { useSettings } from "@/components/settings/settings-provider"
import { Progress } from "@/components/ui/progress"

interface FileWithPath extends File {
  path?: string
  webkitRelativePath: string
}

interface UploadItem {
  id: string
  file: FileWithPath
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
  path?: string
}

export function UploadForm() {
  const [files, setFiles] = useState<UploadItem[]>([])
  const [category, setCategory] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { settings } = useSettings()

  // Process files and folders
  const processFiles = useCallback(
    (fileList: FileList | null, basePath = "") => {
      if (!fileList) return

      const newFiles: UploadItem[] = []
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]

      Array.from(fileList).forEach((file) => {
        const fileWithPath = file as FileWithPath
        let path = basePath

        // Handle files from folder input
        if (fileWithPath.webkitRelativePath) {
          const pathParts = fileWithPath.webkitRelativePath.split("/")
          pathParts.pop() // Remove the filename
          path = pathParts.join("/")
        }

        // Check if it's an image file
        const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`
        if (imageExtensions.includes(fileExt)) {
          newFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file: fileWithPath,
            status: "pending",
            progress: 0,
            path: path || undefined,
          })
        }
      })

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles])
      } else {
        toast({
          title: "没有找到图片文件",
          description: "请选择图片文件上传",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    if (e.target.value) e.target.value = "" // Reset input
  }

  // Handle folder input change
  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    if (e.target.value) e.target.value = "" // Reset input
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Process dropped items (files and folders)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    // Handle files
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }

    // Handle folders (WebKit/Blink)
    if (e.dataTransfer.items) {
      const items = Array.from(e.dataTransfer.items)
      for (const item of items) {
        // Get entry using webkitGetAsEntry
        const entry = item.webkitGetAsEntry?.()
        if (entry?.isDirectory) {
          await processDirectoryEntry(entry as any)
        }
      }
    }
  }

  // Process directory entries recursively
  const processDirectoryEntry = async (entry: any, path = "") => {
    if (entry.isFile) {
      // Process file
      entry.file((file: File) => {
        const fileWithPath = file as FileWithPath
        fileWithPath.path = path ? `${path}/${entry.name}` : entry.name
        processFiles(new DataTransfer().files.add(fileWithPath) as unknown as FileList, path)
      })
    } else if (entry.isDirectory) {
      // Process directory
      const dirReader = entry.createReader()
      const newPath = path ? `${path}/${entry.name}` : entry.name

      // Read directory entries
      const readEntries = () => {
        dirReader.readEntries(async (entries: any[]) => {
          if (entries.length > 0) {
            for (const entry of entries) {
              await processDirectoryEntry(entry, newPath)
            }
            // Continue reading if there are more entries
            readEntries()
          }
        })
      }

      readEntries()
    }
  }

  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  // Upload all files
  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    let successCount = 0
    let errorCount = 0

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.status === "success") continue

      // Update status to uploading
      setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "uploading", progress: 0 } : f)))

      try {
        // Create form data
        const formData = new FormData()
        formData.append("file", file.file)
        if (category) {
          formData.append("category", category)
        }
        // If file has a path, add it as a subfolder
        if (file.path) {
          formData.append("subfolder", file.path)
        }

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) => {
              if (f.id === file.id && f.status === "uploading" && f.progress < 90) {
                return { ...f, progress: f.progress + 10 }
              }
              return f
            }),
          )
        }, 300)

        // Upload the file
        await uploadImage(formData)

        // Clear interval and update status
        clearInterval(progressInterval)
        setFiles((prev) => prev.map((f) => (f.id === file.id ? { ...f, status: "success", progress: 100 } : f)))
        successCount++
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "error",
                  progress: 0,
                  error: error instanceof Error ? error.message : "上传失败",
                }
              : f,
          ),
        )
        errorCount++
      }
    }

    setIsUploading(false)

    // Show toast with results
    if (successCount > 0) {
      toast({
        title: `上传完成`,
        description: `成功上传 ${successCount} 个文件${errorCount > 0 ? `，${errorCount} 个文件失败` : ""}`,
        variant: errorCount > 0 ? "default" : "default",
      })
    } else if (errorCount > 0) {
      toast({
        title: "上传失败",
        description: "所有文件上传失败，请重试",
        variant: "destructive",
      })
    }
  }

  // Clear all files
  const clearFiles = () => {
    if (isUploading) return
    setFiles([])
  }

  // Animation properties based on settings
  const getMotionProps = () => {
    if (!settings.enableAnimations) return {}

    const duration = settings.animationSpeed === "slow" ? 0.7 : settings.animationSpeed === "fast" ? 0.3 : 0.5

    return {
      whileHover: { y: -3 },
      transition: { duration },
    }
  }

  return (
    <FrostedCard className="p-6">
      <h2 className="text-xl font-semibold mb-4">上传图片</h2>

      <div className="space-y-4">
        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-neutral-200 dark:border-neutral-800 hover:border-primary/50"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">拖放文件或文件夹到此处上传</p>
            <p className="text-xs text-muted-foreground">支持 JPG, PNG, GIF, WEBP, SVG 等图片格式</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <File className="h-4 w-4 mr-2" />
              选择文件
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => folderInputRef.current?.click()}
              disabled={isUploading}
            >
              <Folder className="h-4 w-4 mr-2" />
              选择文件夹
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            onChange={handleFolderChange}
            className="hidden"
          />
        </div>

        {/* Category selector */}
        <CategorySelector value={category} onChange={setCategory} />

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">待上传文件 ({files.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={isUploading}
                className="h-8 px-2 text-xs"
              >
                清空
              </Button>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md divide-y">
              <AnimatePresence initial={false}>
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-2 flex items-center text-sm"
                  >
                    <div className="flex-shrink-0 mr-2">
                      {file.status === "success" ? (
                        <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-500"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : file.status === "error" ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="truncate">{file.file.name}</div>
                      {file.path && (
                        <div className="text-xs text-muted-foreground truncate flex items-center">
                          <Folder className="h-3 w-3 inline mr-1" />
                          {file.path}
                        </div>
                      )}
                      {file.status === "uploading" && <Progress value={file.progress} className="h-1 mt-1" />}
                      {file.status === "error" && <div className="text-xs text-destructive">{file.error}</div>}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-2 flex-shrink-0"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading && file.status === "uploading"}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">移除</span>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Upload button */}
        {files.length > 0 && (
          <motion.div {...getMotionProps()}>
            <Button type="button" onClick={uploadFiles} disabled={isUploading || files.length === 0} className="w-full">
              {isUploading ? (
                <>上传中...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  上传到GitHub ({files.length} 个文件)
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </FrostedCard>
  )
}
