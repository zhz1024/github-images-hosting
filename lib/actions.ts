"use server"

import { Octokit } from "@octokit/rest"
import type { ImageItem, GithubConfig, ImageCategory } from "./types"

// GitHub configuration
const githubConfig: GithubConfig = {
  owner: process.env.GITHUB_OWNER || "",
  repo: process.env.GITHUB_REPO || "",
  branch: process.env.GITHUB_BRANCH || "main",
  path: process.env.GITHUB_PATH || "images",
}

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

// Get all categories from the repository
export async function getCategories(): Promise<ImageCategory[]> {
  try {
    if (!githubConfig.owner || !githubConfig.repo) {
      throw new Error("GitHub configuration is incomplete. Please set the environment variables.")
    }

    // The base directory serves as "Uncategorized"
    const defaultCategory: ImageCategory = {
      id: "default",
      name: "未分类",
      path: githubConfig.path,
    }

    // Try to get subdirectories in the main images directory
    try {
      const response = await octokit.repos.getContent({
        owner: githubConfig.owner,
        repo: githubConfig.repo,
        path: githubConfig.path,
        ref: githubConfig.branch,
      })

      if (!Array.isArray(response.data)) {
        return [defaultCategory]
      }

      // Filter directories only
      const directories = response.data.filter((item) => item.type === "dir")

      // Map directories to categories
      const categories = directories.map((dir) => ({
        id: dir.sha,
        name: dir.name,
        path: dir.path,
      }))

      // Add the default category first
      return [defaultCategory, ...categories]
    } catch (error) {
      // If there's an error, just return the default category
      return [defaultCategory]
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

// Create a new category (folder in GitHub)
export async function createCategory(categoryName: string): Promise<ImageCategory> {
  try {
    if (!githubConfig.owner || !githubConfig.repo || !process.env.GITHUB_TOKEN) {
      throw new Error("GitHub configuration is incomplete. Please set the environment variables.")
    }

    // Create a placeholder file to initialize the directory
    const path = `${githubConfig.path}/${categoryName}/.gitkeep`
    const content = Buffer.from("").toString("base64")

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      message: `Create category: ${categoryName}`,
      content,
      branch: githubConfig.branch,
    })

    // Get the directory info
    const dirResponse = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path: `${githubConfig.path}/${categoryName}`,
      ref: githubConfig.branch,
    })

    if (Array.isArray(dirResponse.data)) {
      const placeholder = dirResponse.data.find((file) => file.name === ".gitkeep")

      return {
        id: placeholder?.sha || "new",
        name: categoryName,
        path: `${githubConfig.path}/${categoryName}`,
      }
    }

    return {
      id: "new",
      name: categoryName,
      path: `${githubConfig.path}/${categoryName}`,
    }
  } catch (error) {
    console.error("Error creating category:", error)
    throw error
  }
}

// Get all images from the repository
export async function getImages(): Promise<ImageItem[]> {
  try {
    if (!githubConfig.owner || !githubConfig.repo) {
      throw new Error("GitHub configuration is incomplete. Please set the environment variables.")
    }

    // Get all categories first
    const categories = await getCategories()
    let allImages: ImageItem[] = []

    // For each category, get the images
    for (const category of categories) {
      try {
        const response = await octokit.repos.getContent({
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          path: category.path,
          ref: githubConfig.branch,
        })

        if (!Array.isArray(response.data)) {
          continue
        }

        // Filter only image files
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
        const images = response.data.filter(
          (file) =>
            file.type === "file" &&
            file.name !== ".gitkeep" &&
            imageExtensions.some((ext) => file.name.toLowerCase().endsWith(ext)),
        ) as ImageItem[]

        // Add category information to each image
        images.forEach((image) => {
          image.category = category.name === "未分类" ? undefined : category.name
        })

        allImages = [...allImages, ...images]
      } catch (error) {
        console.error(`Error fetching images from category ${category.name}:`, error)
        // Continue with other categories if one fails
      }
    }

    return allImages
  } catch (error) {
    console.error("Error fetching images:", error)
    throw error
  }
}

// Upload an image to the repository
export async function uploadImage(formData: FormData): Promise<{ url: string }> {
  try {
    if (!githubConfig.owner || !githubConfig.repo || !process.env.GITHUB_TOKEN) {
      throw new Error("GitHub configuration is incomplete. Please set the environment variables.")
    }

    const file = formData.get("file") as File
    if (!file) {
      throw new Error("No file provided")
    }

    // Get category if provided, use default path if not
    const category = formData.get("category") as string | null
    const subfolder = formData.get("subfolder") as string | null

    // Build the path
    let basePath = category ? `${githubConfig.path}/${category}` : githubConfig.path

    // Add subfolder if provided
    if (subfolder) {
      basePath = `${basePath}/${subfolder}`
    }

    // Ensure all directories exist
    if (subfolder) {
      const folders = subfolder.split("/")
      let currentPath = category ? `${githubConfig.path}/${category}` : githubConfig.path

      // Create each folder in the path if it doesn't exist
      for (const folder of folders) {
        if (!folder) continue
        currentPath = `${currentPath}/${folder}`

        try {
          // Check if folder exists
          await octokit.repos.getContent({
            owner: githubConfig.owner,
            repo: githubConfig.repo,
            path: currentPath,
            ref: githubConfig.branch,
          })
        } catch (error) {
          // Folder doesn't exist, create it with a .gitkeep file
          await octokit.repos.createOrUpdateFileContents({
            owner: githubConfig.owner,
            repo: githubConfig.repo,
            path: `${currentPath}/.gitkeep`,
            message: `Create folder: ${currentPath}`,
            content: Buffer.from("").toString("base64"),
            branch: githubConfig.branch,
          })
        }
      }
    }

    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime()
    const filename = `${timestamp}-${file.name.replace(/\s+/g, "-")}`
    const path = `${basePath}/${filename}`

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const content = buffer.toString("base64")

    // Upload to GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      message: `Upload image: ${filename}`,
      content,
      branch: githubConfig.branch,
    })

    // Return the URL to the uploaded file
    const fileUrl = `https://raw.githubusercontent.com/${githubConfig.owner}/${githubConfig.repo}/${githubConfig.branch}/${path}`

    return { url: fileUrl }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// Delete an image from the repository
export async function deleteImage(path: string): Promise<void> {
  try {
    if (!githubConfig.owner || !githubConfig.repo || !process.env.GITHUB_TOKEN) {
      throw new Error("GitHub configuration is incomplete. Please set the environment variables.")
    }

    // Get the file's SHA
    const fileResponse = await octokit.repos.getContent({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      ref: githubConfig.branch,
    })

    if (Array.isArray(fileResponse.data)) {
      throw new Error("Expected a file, got a directory")
    }

    // Delete the file
    await octokit.repos.deleteFile({
      owner: githubConfig.owner,
      repo: githubConfig.repo,
      path,
      message: `Delete image: ${path.split("/").pop()}`,
      sha: fileResponse.data.sha,
      branch: githubConfig.branch,
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}
