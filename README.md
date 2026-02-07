# GitHub Pages 个人主页

个人主页 + 可互动简历，部署在 GitHub Pages。

- **首页**：简介 + 你的 GitHub 仓库列表（通过 GitHub API 拉取）
- **简历页**：教育、技能、实习、项目；技术栈与公司均带链接/图片，可点击跳转

## 本地预览

用任意静态服务器打开根目录，例如：

```bash
# Python 3
python -m http.server 8000

# 或 npx
npx serve .
```

浏览器访问 `http://localhost:8000`。

## 部署到 GitHub Pages

### 1. 配置 GitHub 用户名

在 `index.html` 里把占位符改成你的 GitHub 用户名：

```html
<script>
  window.GITHUB_USER = '你的GitHub用户名';  // 替换 YOUR_GITHUB_USERNAME
</script>
```

这样首页会拉取你的公开仓库，并让「GitHub Profile」指向你的个人页。

### 2. 初始化并推送到 GitHub

若尚未初始化 git：

```bash
git init
git add .
git commit -m "Initial commit: GitHub Pages site + resume"
```

在 GitHub 上新建仓库（例如 `username.github.io` 做个人站，或任意仓库名做项目页），然后：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 3. 开启 GitHub Pages

- 打开仓库 → **Settings** → **Pages**
- **Source** 选 **Deploy from a branch**
- **Branch** 选 `main`，目录选 **/ (root)**，保存

几分钟后访问：

- 个人站（仓库名为 `用户名.github.io`）：`https://你的用户名.github.io/`
- 项目站：`https://你的用户名.github.io/仓库名/`

若为**项目站**，需保证资源路径正确（相对路径如 `assets/css/style.css`、`resume.html` 在项目根目录下即可）。

## 替换公司 Logo（可选）

简历页公司图标当前使用 Google Favicon 服务。若要换成正式 logo：

1. 将 logo 图放到 `assets/images/`（例如 `zhipin.png`、`pine-ai.png`）
2. 在 `resume.html` 里把对应 `<img class="company-logo" src="...">` 的 `src` 改为 `assets/images/zhipin.png` 等

## 文件结构

```
.
├── index.html          # 首页
├── resume.html         # 简历页
├── assets/
│   ├── css/style.css   # 样式
│   └── js/
│       ├── main.js     # 通用逻辑（如 Profile 链接）
│       └── repos.js    # 拉取 GitHub 仓库列表
├── .gitignore
└── README.md           # 本说明
```

简历正文来源：原 README 中的教育、技能、实习、项目经历，已整理进 `resume.html` 并加上技术与公司链接。
