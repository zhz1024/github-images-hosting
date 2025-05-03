# github-images-hosting
一个基于Next.js，GithubAPI的图床系统
### GitHub 图床

一个基于 GitHub 仓库的现代化图床系统，支持分类管理、批量上传、拖放操作和美观的用户界面。





## 功能特点

- 🖼️ 基于 GitHub 仓库存储图片，无需额外服务器
- 📁 支持图片分类管理
- 📤 拖放上传文件和文件夹
- 🔍 图片搜索和筛选
- 📋 一键复制多种格式的图片链接（直接链接、Markdown、HTML）
- 🌓 明暗主题切换
- ✨ 可自定义的动画效果
- 🎨 自定义背景和界面设置
- 🗑️ 图片删除功能（带确认对话框）


## 技术栈

- **前端框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **状态管理**: React Context API
- **API**: GitHub REST API (通过 Octokit)
- **部署**: Vercel, Netlify 或自托管


## 项目结构

```plaintext
github-image-host/
├── app/                    # Next.js App Router 目录
│   ├── layout.tsx          # 根布局组件
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── auth/               # 认证相关组件
│   ├── settings/           # 设置相关组件
│   ├── ui/                 # UI 组件
│   ├── background-effect.tsx  # 背景效果组件
│   ├── category-selector.tsx  # 分类选择器组件
│   ├── delete-image-dialog.tsx # 删除确认对话框
│   ├── header.tsx          # 页头组件
│   ├── image-gallery.tsx   # 图片库组件
│   ├── theme-switcher.tsx  # 主题切换组件
│   └── upload-form.tsx     # 上传表单组件
├── hooks/                  # 自定义 React Hooks
├── lib/                    # 工具函数和类型定义
│   ├── actions.ts          # 服务器操作
│   ├── types.ts            # TypeScript 类型定义
│   └── utils.ts            # 工具函数
├── public/                 # 静态资源
├── .env.example            # 环境变量示例
├── next.config.js          # Next.js 配置
├── package.json            # 项目依赖
├── tailwind.config.ts      # Tailwind CSS 配置
└── tsconfig.json           # TypeScript 配置
```

## 环境变量配置

项目需要以下环境变量才能正常工作：

```plaintext
# GitHub 配置
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
GITHUB_PATH=images
GITHUB_TOKEN=your-personal-access-token
```

创建一个 `.env.local` 文件（本地开发）或在部署平台上设置这些环境变量。

### GitHub Token 权限

创建 GitHub 个人访问令牌时，需要授予以下权限：

- `repo` - 完整的仓库访问权限（用于读取和写入文件）


## 部署指南

### 本地开发

1. 克隆仓库：


```shellscript
git clone https://github.com/zhz1024/github-images-hosting.git
cd github-image-host
```

2. 安装依赖：


```shellscript
npm install
# 或
yarn
# 或
pnpm install
```

3. 创建 `.env.local` 文件并设置环境变量（参见上面的环境变量配置）。
4. 启动开发服务器：


```shellscript
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。


### Netlify 部署

1. 在 [Netlify](https://www.netlify.com/) 上创建一个账户。
2. 点击 "New site from Git" 按钮。
3. 选择 GitHub 作为 Git 提供商，并授权 Netlify 访问您的仓库。
4. 选择 `github-image-host` 仓库。
5. 配置构建设置：

1. 构建命令：`pnpm run build`
2. 发布目录：`.next`



6. 在 "Advanced" 部分，添加环境变量（参见上面的环境变量配置）。
7. 点击 "Deploy site" 按钮。
8. 部署完成后，您可以在 Netlify 提供的域名上访问您的图床应用。


### Vercel 部署

1. 在 [Vercel](https://vercel.com/) 上创建一个账户。
2. 点击 "New Project" 按钮。
3. 导入 `github-image-host` 仓库。
4. 配置项目：

1. 框架预设：Next.js
2. 根目录：`./`



5. 在 "Environment Variables" 部分，添加环境变量（参见上面的环境变量配置）。
6. 点击 "Deploy" 按钮。
7. 部署完成后，您可以在 Vercel 提供的域名上访问您的图床应用。


### 自托管部署

1. 构建应用：


```shellscript
npm run build
# 或
yarn build
# 或
pnpm build
```

2. 启动生产服务器：


```shellscript
npm start
# 或
yarn start
# 或
pnpm start
```

3. 或者，您可以使用 Docker 进行部署：


```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 使用指南

### 上传图片

1. 点击 "选择文件" 或 "选择文件夹" 按钮，或将文件/文件夹拖放到上传区域。
2. 选择一个分类（可选）。
3. 点击 "上传到 GitHub" 按钮。
4. 上传完成后，图片将显示在图片库中。


### 管理分类

1. 点击 "新建分类" 按钮。
2. 输入分类名称。
3. 点击 "创建分类" 按钮。


### 复制图片链接

1. 在图片库中点击一张图片。
2. 在图片详情面板中，选择链接类型（直接链接、Markdown 或 HTML）。
3. 点击复制按钮。


### 删除图片

1. 在图片库中，将鼠标悬停在图片上，然后点击删除图标。
2. 或者，在图片详情面板中点击 "删除图片" 按钮。
3. 在确认对话框中点击 "确认删除"。


### 自定义设置

1. 点击右上角的设置图标。
2. 在设置面板中，您可以：

1. 启用/禁用动画效果
2. 调整动画速度
3. 启用/禁用背景效果
4. 调整背景透明度
5. 设置自定义背景图片





## 开发指南

### 添加新功能

1. 创建一个新分支：


```shellscript
git checkout -b feature/your-feature-name
```

2. 实现您的功能。
3. 提交您的更改：


```shellscript
git commit -m "Add your feature"
```

4. 推送到远程仓库：


```shellscript
git push origin feature/your-feature-name
```

### 修改现有组件

项目使用模块化的组件结构，您可以轻松修改或扩展现有组件。例如，要修改上传表单：

1. 打开 `components/upload-form.tsx`。
2. 进行必要的更改。
3. 保存文件并测试您的更改。


### 添加新的 API 端点

项目使用 Next.js 的服务器操作（Server Actions）来处理 API 请求。要添加新的 API 功能：

1. 打开 `lib/actions.ts`。
2. 添加您的新函数，使用 `"use server"` 指令标记为服务器操作。
3. 实现您的逻辑。
4. 从组件中导入并使用您的新函数。


## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 仓库。
2. 创建一个新分支。
3. 进行更改。
4. 提交 Pull Request。


## 许可证

MIT

---

## 常见问题

### 图片上传失败

- 检查您的 GitHub Token 是否有效且具有正确的权限。
- 确保您的仓库存在且您有写入权限。
- 检查环境变量是否正确设置。


### 无法创建分类

- 确保您的 GitHub Token 具有创建文件的权限。
- 检查网络连接。


### 部署问题

- 确保所有环境变量都已正确设置。
- 检查构建日志以获取详细错误信息。


---

希望这个 README 对您有所帮助！如果您有任何问题或建议，请随时提出 Issue 或 Pull Request。
