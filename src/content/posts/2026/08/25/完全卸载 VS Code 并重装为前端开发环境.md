---
author: "HAOGRE"
pubDatetime: 2026-08-25T09:58:23.495Z
title: "macOS 上彻底卸载并重装 VS Code，配好前端开发环境"
featured: false
draft: false
translationKey: "完全卸载 VS Code 并重装为前端开发环境"
tags:
  - "编程"
  - "其他"
  - "随笔"
description: "从应用、配置、缓存到扩展彻底清理 VS Code，再用 Homebrew 重装并配好 React、Vue、TypeScript 开发环境。"
---

VS Code 用久了，扩展越装越多，`settings.json` 也可能被各种教程改得面目全非。等某个扩展开始抽风时，排查往往不如推倒重来。把 app 拖进废纸篓还不够，配置、缓存和扩展目录都可能留在系统里，重装后又原样继承旧问题。下面这套流程会先彻底清空，再重新安装并配好前端开发环境。跑完后，打开 VS Code 就能写 React、Vue 和 TypeScript。

## 1. 先优雅退出 VS Code

删除 app 前，先把进程退出。否则 macOS 可能锁住文件，后续配置也可能写不进去：

```bash
osascript -e 'tell application "Visual Studio Code" to quit'
```

等几秒，确认进程已经退出，再继续：

```bash
pgrep -f "/Applications/Visual Studio Code.app" || echo "已退出"
```

如果开了多个窗口，或者还有未保存的内容，`osascript` 退出可能需要等三五秒，给它一点时间。

## 2. 彻底删除：应用、配置、缓存和扩展

VS Code 在 macOS 上会把文件分散在多个位置，下面一次性清理：

```bash
rm -rf "/Applications/Visual Studio Code.app" \\
  ~/Library/Application\\ Support/Code \\
  ~/Library/Caches/com.microsoft.VSCode \\
  ~/Library/Caches/com.microsoft.VSCode.ShipIt \\
  ~/Library/Preferences/com.microsoft.VSCode.plist \\
  ~/Library/Saved\\ Application\\ State/com.microsoft.VSCode.savedState \\
  ~/Library/Logs/Code \\
  ~/.vscode
```

每个路径的作用：

- `~/.vscode`：存放所有扩展，我这次清掉了 42 个。旧扩展残留是重装后问题继续出现的头号原因
- `~/Library/Application Support/Code`：存放 `settings.json`、`keybindings.json`、工作区状态和扩展运行数据
- `~/Library/Caches/com.microsoft.VSCode*`：缓存和自动更新残留
- `~/Library/Preferences/com.microsoft.VSCode.plist`：偏好设置 plist
- `~/Library/Saved Application State/...savedState`：窗口位置等运行状态

清理完后再扫一遍。通常还会剩下 ShipIt 和 HTTPStorages 的碎屑：

```bash
rm -rf ~/Library/HTTPStorages/com.microsoft.VSCode \\
  ~/Library/Preferences/ByHost/com.microsoft.VSCode.ShipIt.*.plist
```

## 3. 用 Homebrew 重装

通过 brew 安装的 VS Code 会自动把 `code` 命令链接到 PATH，省去手动执行“Install code command in PATH”这一步：

```bash
brew install --cask visual-studio-code
```

验证是否安装成功：

```bash
code --version
```

## 4. 安装前端开发扩展

下面这组扩展覆盖 React、Vue、Tailwind、格式化和预览，够用，也不算臃肿。TypeScript 支持是 VS Code 内置的，不需要单独安装。

- **Prettier** (`esbenp.prettier-vscode`)：代码格式化
- **ESLint** (`dbaeumer.vscode-eslint`)：lint 与自动修复
- **EditorConfig** (`EditorConfig.EditorConfig`)：跨编辑器缩进、换行兜底
- **ES7+ React snippets** (`dsznajder.es7-react-js-snippets`)：React 常用代码片段
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)：同步修改首尾标签
- **Vue (Volar)** (`Vue.volar`)：Vue 3 官方语言支持
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)：class 智能补全
- **Path Intellisense** (`christian-kohler.path-intellisense`)：文件路径补全
- **Live Server** (`ritwickdey.liveserver`)：静态页面本地热预览
- **GitLens** (`eamodio.gitlens`)：Git 增强，支持 blame/diff 内联
- **Material Icon Theme** (`PKief.material-icon-theme`)：文件树图标，前端项目里一堆配置文件一眼就能认出来

一键安装：

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension EditorConfig.EditorConfig
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension Vue.volar
code --install-extension bradlc.vscode-tailwindcss
code --install-extension christian-kohler.path-intellisense
code --install-extension ritwickdey.liveserver
code --install-extension eamodio.gitlens
code --install-extension PKief.material-icon-theme
```

## 5. 写入默认配置

配置文件位于 `~/Library/Application Support/Code/User/settings.json`。这版配置主要做了几件事：

- 保存时自动格式化、运行 ESLint 自动修复并整理 import。前端项目里，九成格式噪音靠这一步就能消掉
- 2 空格缩进、LF 换行，前端圈通用约定
- 各语言的默认格式化器统一指向 Prettier，避免多个格式化器互相冲突
- 在 JSX/Vue 中启用 Emmet，并开启 Tailwind 的跨语言提示
- 隐藏 `node_modules`、`dist`、`build` 等噪声目录

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.fontLigatures": true,
  "editor.stickyScroll.enabled": true,
  "editor.linkedEditing": true,
  "editor.guides.bracketPairs": "active",
  "editor.minimap.enabled": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "files.eol": "\n",
  "files.autoSave": "onFocusChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/.nuxt": true,
    "**/build": true
  },
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
    "vue",
    "json",
    "html"
  ],
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[javascriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[jsonc]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[html]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[css]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[scss]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[markdown]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "tailwindCSS.includeLanguages": {
    "vue": "html",
    "javascriptreact": "javascriptreact",
    "typescriptreact": "typescriptreact"
  },
  "tailwindCSS.emmetCompletions": true,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact",
    "vue": "html"
  },
  "javascript.updateImportsOnPasteMove.enabled": true,
  "typescript.updateImportsOnPasteMove.enabled": true,
  "typescript.suggest.paths": true,
  "git.autofetch": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/build": true,
    "**/pnpm-lock.yaml": true,
    "**/package-lock.json": true,
    "**/yarn.lock": true
  },
  "terminal.integrated.scrollback": 10000,
  "workbench.startupEditor": "newUntitledFile",
  "workbench.iconTheme": "material-icon-theme"
}
```

## 6. 打开验证

```bash
open -a "Visual Studio Code"
```

能正常启动，Material Icon Theme 生效，随便建一个 React 项目并确认保存时自动格式化跑通，就算交付完成。整套流程跑下来只要几分钟，比在一个已经被各种旧配置污染的环境里排查某个扩展为什么抽风省心得多。
