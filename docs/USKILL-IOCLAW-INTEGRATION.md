# uskill.cn3 项目分析与 @jianghuizhong/uskill 集成方案

本文档分析 uskill.cn3 目录结构、packages 关系，以及 **uskillcn** 如何集成 `@jianghuizhong/uskill`。

---

## 一、uskill.cn3 项目结构

### 1.1 目录概览

```
uskill.cn3/
├── package.json              # 根项目：Next.js 网站
├── packages/
│   └── uskill-cli/           # @jianghuizhong/uskill
│       ├── package.json
│       └── bin/uskill.js
├── app/                      # Next.js App Router
├── lib/
├── components/
└── ...
```

### 1.2 根项目 vs packages

| 层级 | 名称 | 用途 |
|------|------|------|
| **根项目** | skills-viewer | uskill.cn 网站（Next.js 15），技能展示、提交、ClawHub API |
| **packages/uskill-cli** | @jianghuizhong/uskill | 命令行工具，面向 uskill.cn 的 CLI 客户端 |

### 1.3 根项目 package.json 关键配置

```json
{
  "scripts": {
    "uskill": "node packages/uskill-cli/bin/uskill.js",
    "uskill:publish": "cd packages/uskill-cli && npm publish"
  }
}
```

- 开发时通过 `yarn uskill` 或 `pnpm uskill` 调用本地 uskill-cli
- 发布时单独 publish `@jianghuizhong/uskill` 到 npm

### 1.4 包管理

- 使用 **pnpm**（从 pnpm-lock.yaml 可见）
- `packages/uskill-cli` 为 workspace 子包，无独立 `node_modules`（依赖由根项目 hoist）

---

## 二、@jianghuizhong/uskill 分析

### 2.1 定位

- **npm 包名**：`@jianghuizhong/uskill`
- **作用**：uskill.cn 官方 CLI，基于 ClawHub 协议，默认使用 uskill.cn 作为 registry
- **与 clawhub 关系**：**代理/包装**，不是 fork。设置好环境变量后调用 `clawhub`（或 npx clawhub）

### 2.2 实现逻辑（bin/uskill.js）

```javascript
// 1. 自定义命令：login / logout
if (cmd === 'login') { await runLogin(token); return; }
if (cmd === 'logout') { await runLogout(); return; }

// 2. 其他命令：透传 clawhub
const env = {
  ...process.env,
  CLAWHUB_SITE: 'https://uskill.cn',
  CLAWHUB_REGISTRY: 'https://uskill.cn',
};
if (config?.token) env.CLAWHUB_PUBLISH_TOKEN = config.token;

// 3. 调用 clawhub
spawn(useNpx ? 'npx' : 'node', useNpx ? ['clawhub', ...args] : [clawhubPath, ...args], { env });
```

### 2.3 核心行为

| 能力 | 说明 |
|------|------|
| **Registry** | 固定 `CLAWHUB_REGISTRY=https://uskill.cn` |
| **Login** | 校验 token，写入 `~/.config/uskill/config.json` |
| **Publish** | 从 config 读取 token，设置 `CLAWHUB_PUBLISH_TOKEN` 传给 clawhub |
| **search/install/list/explore** | 直接透传 clawhub，由 uskill.cn API 响应 |

### 2.4 依赖

- `package.json` 中 `dependencies: {}` 为空
- 运行时通过 `npx clawhub` 或本地 `node_modules/clawhub` 调用 clawhub
- 发布到 npm 时，用户 `npm i -g @jianghuizhong/uskill` 后，首次执行会触发 npx 下载 clawhub

---

## 三、uskillcn 集成 @jianghuizhong/uskill 的方案

### 3.1 目标

让 uskillcn 用户能从 **uskill.cn** 搜索、安装技能，而不仅限于 clawhub.ai。

### 3.2 方案对比

| 方案 | 说明 | 改造量 | 推荐 |
|------|------|--------|------|
| **A：环境变量切换** | 继续用 clawhub，通过 `CLAWHUB_REGISTRY` 切换 registry | 小 | ✅ |
| **B：替换为 uskill CLI** | 用 @jianghuizhong/uskill 替代 clawhub 作为 CLI 入口 | 中 | 可选 |

### 3.3 方案 A：环境变量切换（推荐）

**原理**：@jianghuizhong/uskill 的本质是设置 `CLAWHUB_REGISTRY=https://uskill.cn` 后调用 clawhub。uskillcn 可直接在 spawn 时传入相同环境变量，无需安装 uskill 包。

**改造点**：

1. **ClawHubService** 支持可配置 registry
2. **设置页** 增加「技能源」选项：ClawHub / uskill.cn
3. **runCommand** 时根据选择传入 `CLAWHUB_REGISTRY`

**代码示例**：

```typescript
// electron/gateway/clawhub.ts
const env = {
  ...baseEnv,
  CI: 'true',
  FORCE_COLOR: '0',
  CLAWHUB_WORKDIR: this.workDir,
};
// 若用户选择 uskill.cn
if (this.registry === 'uskill.cn') {
  env.CLAWHUB_REGISTRY = 'https://uskill.cn';
  env.CLAWHUB_SITE = 'https://uskill.cn';
}
```

**存储**：在 electron-store 或 settings 中增加 `skillRegistry: 'clawhub' | 'uskill'`。

**工作量**：约 1 天。

---

### 3.4 方案 B：替换为 uskill CLI

**适用**：希望与 uskill 生态完全一致，或未来支持 publish 时复用 uskill 的 token 配置。

**改造点**：

1. **依赖**：`pnpm add @jianghuizhong/uskill`（或作为可选依赖）
2. **paths.ts**：增加 `getUskillCliEntryPath()`，指向 `node_modules/@jianghuizhong/uskill/bin/uskill.js`
3. **ClawHubService**：当选择 uskill 时，调用 `uskill` 而非 `clawhub`，参数保持一致（search、install、list 等）
4. **workDir**：uskill 使用与 clawhub 相同的 `CLAWHUB_WORKDIR`，技能安装目录一致（`~/.openclaw/skills/`）

**注意**：
- uskill 的 `search`、`install` 等参数与 clawhub 相同，可直接透传
- uskill 内部会设置 `CLAWHUB_REGISTRY`，无需 uskillcn 再传
- 若用户已在终端执行 `uskill login`，token 存于 `~/.config/uskill/config.json`，但 uskillcn 的 spawn 是独立进程，不会自动继承该 config，除非 uskill 启动时读取。根据 uskill 源码，它会 `readConfig()` 并设置 `CLAWHUB_PUBLISH_TOKEN`，对 search/install 无影响。

**工作量**：约 2 天（含路径解析、打包时包含 uskill）。

---

## 四、推荐实施步骤（方案 A）

### 4.1 后端

1. 在 `electron/utils/paths.ts` 或 `electron/gateway/clawhub.ts` 中，从 settings 读取 `skillRegistry`。
2. 在 `ClawHubService.runCommand` 的 `env` 中，若 `skillRegistry === 'uskill'`，添加：
   ```ts
   CLAWHUB_REGISTRY: 'https://uskill.cn',
   CLAWHUB_SITE: 'https://uskill.cn',
   ```

### 4.2 设置页

1. 在 Settings 增加「技能源」或「技能注册表」选项：
   - ClawHub（默认）
   - uskill.cn
2. 保存到 `settings.skillRegistry`。

### 4.3 前端

1. Skills 页面在搜索/安装时无需改逻辑，后端已切换 registry。
2. 可选：在「发现技能」区域增加来源标识（如「来自 uskill.cn」）。

### 4.4 文档

- 在 README 或帮助中说明：可选择 uskill.cn 作为技能源，支持中文技能生态。

---

## 五、方案 B 实施要点（若选用）

### 5.1 依赖

```json
{
  "dependencies": {
    "@jianghuizhong/uskill": "^1.0.2"
  }
}
```

### 5.2 路径解析

```typescript
// electron/utils/paths.ts
export function getUskillCliEntryPath(): string {
  return join(app.getAppPath(), 'node_modules', '@jianghuizhong/uskill', 'bin', 'uskill.js');
}
```

### 5.3 ClawHubService 分支

```typescript
// 当 registry === 'uskill' 时
const cliEntry = getUskillCliEntryPath();
// 使用 uskill 替代 clawhub，参数相同：search, install, list, uninstall
```

### 5.4 打包

- electron-builder 需将 `@jianghuizhong/uskill` 及其依赖（若有）打包进 asar。
- uskill 的 `dependencies` 为空，运行时依赖 npx 或 clawhub。若 uskill 不包含 clawhub，需同时保留 clawhub 依赖，或确保 uskill 能通过 npx 找到 clawhub。

---

## 六、总结

| 维度 | 说明 |
|------|------|
| **uskill.cn3 结构** | 根项目 = 网站，packages/uskill-cli = @jianghuizhong/uskill |
| **@jianghuizhong/uskill** | clawhub 的 registry 包装，默认 uskill.cn |

| **uskillcn 集成** | 推荐方案 A：传 `CLAWHUB_REGISTRY`，无需安装 uskill |
| **改造量** | 方案 A：约 1 天；方案 B：约 2 天 |

---

## 七、参考

- [uskill.cn](https://uskill.cn)
- [@jianghuizhong/uskill 使用指南](../uskill.cn3/docs/uskill-cli-usage.md)
- [CLI 说明页](https://uskill.cn/zh-CN/cli)
