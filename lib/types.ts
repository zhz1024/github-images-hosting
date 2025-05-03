export interface ImageItem {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
  category?: string // Added for categorization
}

export interface GithubConfig {
  owner: string
  repo: string
  branch: string
  path: string
}

export interface ImageCategory {
  id: string
  name: string
  path: string
}
