# uskillcn 构建与打包指南

本文档说明如何从源码构建 uskillcn 安装包，供最终用户安装使用。

---

## 环境准备

### 必需环境

| 依赖 | 要求 |
|------|------|
| **Node.js** | 22+（推荐 LTS） |
| **pnpm** | 9+（版本由 `package.json` 的 `packageManager` 字段固定） |

### 初始化

```bash
# 启用并准备 pnpm（使用 package.json 中锁定的版本）
corepack enable && corepack prepare

# 安装依赖并下载 uv
pnpm run init
```

> `pnpm run init` 等同于 `pnpm install` + `pnpm run uv:download`，会下载 OpenClaw 所需的 uv 运行时。

---

## 构建命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 完整构建并打包**当前平台** |
| `pnpm package` | 与 `build` 相同 |
| `pnpm package:win` | 打包 **Windows** 安装包 |
| `pnpm package:mac` | 打包 **macOS** 安装包 |
| `pnpm package:linux` | 打包 **Linux** 安装包 |
| `pnpm release` | 构建并**发布**（含自动更新配置） |

---

## 构建流程

`pnpm build` / `pnpm package` 会依次执行：

1. **`vite build`** — 构建前端（React + Vite）
2. **`zx scripts/bundle-openclaw.mjs`** — 打包 OpenClaw 运行时
3. **`zx scripts/bundle-openclaw-plugins.mjs`** — 打包 OpenClaw 插件（钉钉、企微等）
4. **`electron-builder`** — 生成各平台安装包

---

## 输出位置与格式

安装包输出到 **`release/`** 目录，命名格式为：

```
uskillcn-{version}-{os}-{arch}.{ext}
```

### 各平台输出示例

| 平台 | 格式 | 示例 |
|------|------|------|
| **Windows** | NSIS 安装程序 | `uskillcn-0.1.24-alpha.9-win-x64.exe`、`uskillcn-0.1.24-alpha.9-win-arm64.exe` |
| **macOS** | DMG、ZIP | `uskillcn-0.1.24-alpha.9-mac-x64.dmg`、`uskillcn-0.1.24-alpha.9-mac-arm64.dmg` |
| **Linux** | AppImage、deb、rpm | `uskillcn-0.1.24-alpha.9-linux-x64.AppImage`、`*.deb`、`*.rpm` |

---

## 跨平台打包说明

| 构建环境 | 可打包目标 |
|----------|------------|
| **Windows** | Windows（x64、arm64） |
| **macOS** | macOS（x64、arm64）、Linux |
| **Linux** | Linux（x64、arm64） |

> 在 Windows 上打包 macOS/Linux 需要额外配置（如 Wine、CI）；在 macOS 上打包 Windows 通常需要 CI 或 Wine。

---

## 发布构建（含自动更新）

```bash
pnpm run release
```

该命令会：

1. 执行 `pnpm run uv:download` 下载 uv
2. 完整构建并打包
3. 发布到配置的更新源（阿里云 OSS、GitHub Releases）

适用于正式发布版本，支持应用内自动更新。

---

## 快速示例

### 在 Windows 上构建 Windows 安装包

```bash
cd uskillcn
pnpm run init
pnpm package:win
```

完成后在 `release/` 目录下可找到：

- `uskillcn-*-win-x64.exe`
- `uskillcn-*-win-arm64.exe`

### 在 macOS 上构建 macOS 安装包

```bash
cd uskillcn
pnpm run init
pnpm package:mac
```

### 在 Linux 上构建 Linux 安装包

```bash
cd uskillcn
pnpm run init
pnpm package:linux
```

---

## 相关配置

- **electron-builder 配置**：`electron-builder.yml`
- **输出目录**：`release/`（在 `electron-builder.yml` 的 `directories.output` 中定义）
- **构建资源**：`resources/`（图标、二进制等）

---

## 常见问题

### pnpm 版本不匹配

使用 `corepack enable && corepack prepare` 激活 `package.json` 中锁定的 pnpm 版本。

### uv 下载失败

可单独执行 `pnpm run uv:download`，或按平台下载：

- `pnpm run uv:download:win` — Windows
- `pnpm run uv:download:mac` — macOS
- `pnpm run uv:download:linux` — Linux
- `pnpm run uv:download:all` — 全平台

### 仅构建前端（不打包）

```bash
pnpm run build:vite
```

仅生成前端产物，不执行 OpenClaw 打包和 electron-builder。
