---
author: "HAOGRE"
pubDatetime: 2026-08-25T09:58:23.495Z
title: "How to Completely Uninstall and Reinstall VS Code on macOS for Front-End Development"
featured: false
draft: false
lang: en
translationKey: "完全卸载 VS Code 并重装为前端开发环境"
tags:
  - "programming"
  - "miscellaneous"
  - "musings"
description: "A clean macOS reset for VS Code: remove old config, reinstall with Homebrew, and set up React/Vue/TypeScript."
---

After using VS Code for a while, extensions pile up and `settings.json` gets mangled by snippets from every tutorial you have followed. When one extension starts acting up, troubleshooting can take longer than starting over. Dragging the app to the Trash is not enough. Your configuration, caches, and extension directories remain, so a reinstall can bring the same problems right back. The workflow below wipes everything, reinstalls VS Code, and sets it up as a front-end development environment. When you are done, you can open it and start writing React, Vue, or TypeScript.

## 1. Quit VS Code cleanly

Quit the app before deleting it. Otherwise, macOS may keep files locked and prevent the configuration from being written:

```bash
osascript -e 'tell application "Visual Studio Code" to quit'
```

Wait a few seconds, then confirm that the process is gone before continuing:

```bash
pgrep -f "/Applications/Visual Studio Code.app" || echo "已退出"
```

If you have multiple windows open or unsaved changes, `osascript` may take three to five seconds to quit. Give it a moment.

## 2. Remove everything: the app, configuration, caches, and extensions

VS Code stores files in several places on macOS, so clear them all at once:

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

Here is what each path contains:

- `~/.vscode`: All extensions. I removed 42 this time. Leftover extensions are the number one reason old problems return after a reinstall
- `~/Library/Application Support/Code`: `settings.json`, `keybindings.json`, workspace state, and extension runtime data
- `~/Library/Caches/com.microsoft.VSCode*`: Caches and auto-update leftovers
- `~/Library/Preferences/com.microsoft.VSCode.plist`: The preferences plist
- `~/Library/Saved Application State/...savedState`: Window position and other runtime state

After that, scan once more. ShipIt and HTTPStorages leftovers often remain:

```bash
rm -rf ~/Library/HTTPStorages/com.microsoft.VSCode \\
  ~/Library/Preferences/ByHost/com.microsoft.VSCode.ShipIt.*.plist
```

## 3. Reinstall with Homebrew

Installing VS Code with brew automatically links the `code` command into your PATH, so you can skip the manual “Install code command in PATH” step:

```bash
brew install --cask visual-studio-code
```

Verify the installation:

```bash
code --version
```

## 4. Install front-end development extensions

The following set covers React, Vue, Tailwind, formatting, and previews without getting bloated. TypeScript support is built into VS Code, so you do not need a separate extension.

- **Prettier** (`esbenp.prettier-vscode`): Code formatting
- **ESLint** (`dbaeumer.vscode-eslint`): Linting and automatic fixes
- **EditorConfig** (`EditorConfig.EditorConfig`): A cross-editor fallback for indentation and line endings
- **ES7+ React snippets** (`dsznajder.es7-react-js-snippets`): Common React snippets
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`): Renames matching opening and closing tags together
- **Vue (Volar)** (`Vue.volar`): Official language support for Vue 3
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`): Class name completion
- **Path Intellisense** (`christian-kohler.path-intellisense`): File path completion
- **Live Server** (`ritwickdey.liveserver`): Local live preview for static pages
- **GitLens** (`eamodio.gitlens`): Git enhancements, including inline blame and diff
- **Material Icon Theme** (`PKief.material-icon-theme`): File-tree icons that make the many configuration files in front-end projects easy to recognize

Install them all at once:

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

## 5. Write the default settings

The settings file is at `~/Library/Application Support/Code/User/settings.json`. This setup makes a few deliberate choices:

- Format on save, ESLint auto-fixes, and import organization. In a front-end project, this takes care of roughly nine-tenths of the formatting noise
- Two-space indentation and LF line endings, the standard convention across front-end projects
- Prettier is the default formatter for each language, so formatters do not fight each other
- Emmet is enabled in JSX/Vue, with Tailwind suggestions enabled across languages
- Noisy directories such as `node_modules`, `dist`, and `build` are hidden

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

## 6. Open VS Code and verify it

```bash
open -a "Visual Studio Code"
```

If VS Code launches normally, Material Icon Theme is active, and saving a throwaway React project triggers automatic formatting, you are done. The whole process takes a few minutes and is less work than chasing down why one extension is misbehaving in an old, messy environment.
