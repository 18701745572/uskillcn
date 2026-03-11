# uskill.cn 技能集成分析

本文档分析 [uskill.cn](https://www.uskill.cn/) 的技能是否可集成到 uskillcn 项目，以及可行的改造方案。

---

## 一、格式兼容性分析

### 1.1 技能标准对比

| 维度 | uskill.cn (Cursor) | uskillcn (OpenClaw/Clawdbot) |
|------|-------------------|---------------------------|
| **标准** | [Agent Skills](https://agentskills.io) | AgentSkills 兼容 |
| **核心文件** | `SKILL.md` | `SKILL.md` |
| **Frontmatter** | YAML (`name`, `description` 必填) | 相同 |
| **目录结构** | `skill-name/SKILL.md`, `scripts/`, `references/`, `assets/` | 相同 |
| **加载位置** | `~/.cursor/skills/`, `.cursor/skills/` | `~/.openclaw/skills/`, `<workspace>/skills/` |

**结论**：uskill.cn 的 Cursor Skills 与 uskillcn 使用的 AgentSkills 格式**完全兼容**，无需格式转换。

### 1.2 可能的差异点

- **Rules vs Skills**：uskill.cn 可能同时分享 Cursor Rules（`.mdc`）和 Skills（`SKILL.md`）。仅 Skills 可直接用于 OpenClaw。
- **metadata 扩展**：Clawdbot 支持 `metadata.clawdbot`（gating、install 等），Cursor 技能通常无此字段，但不影响基本使用。

---

## 二、当前 uskillcn 技能架构

### 2.1 技能来源

- **ClawHub**：`clawhub` 包，默认站点 `https://clawhub.ai`
- **API**：`/api/clawhub/search`、`/api/clawhub/install`、`/api/clawhub/list`、`/api/clawhub/uninstall`
- **安装目录**：`~/.openclaw/skills/`（由 `CLAWHUB_WORKDIR` 决定）
- **安装方式**：仅支持通过 ClawHub 注册表的 `slug` 安装，**不支持** GitHub URL 或任意 URL 安装

### 2.2 关键代码路径

- `electron/gateway/clawhub.ts`：ClawHubService，调用 `clawhub` CLI
- `electron/api/routes/skills.ts`：HTTP 路由
- `src/stores/skills.ts`：前端状态与 API 调用

---

## 三、uskill.cn 集成改造方案

### 方案 A：uskill.cn 作为附加技能源（需 uskill.cn API）

**前提**：uskill.cn 提供公开 API（搜索、获取技能包下载链接）。

**改造**：

1. 新增 `UskillSource` 或扩展 `ClawHubService`，支持多源
2. 在 Skills 页面增加「技能源」切换：ClawHub / uskill.cn
3. 搜索时按源分别请求，合并展示
4. 安装时：若来自 uskill.cn，需有下载 URL（zip/tarball 或 GitHub raw）

**工作量**：中高，依赖 uskill.cn API 文档。

---

### 方案 B：从 GitHub 安装（推荐，与 Cursor 一致）

**前提**：uskill.cn 技能托管在 GitHub，或用户可提供 GitHub 仓库链接。

**改造**：

1. 新增 API：`/api/skills/install-from-github`
2. 参数：`{ repo: "owner/repo", path?: "skills/my-skill" }`
3. 实现：使用 `git clone` 或 GitHub API 下载指定路径，解压到 `~/.openclaw/skills/<skill-name>/`
4. 前端：在 Skills 页面增加「从 GitHub 安装」入口，支持粘贴 `https://github.com/xxx/yyy` 或 `owner/repo`

**参考**：Cursor 文档 [Installing skills from GitHub](https://cursor.com/docs/context/skills#installing-skills-from-github)

**工作量**：中，不依赖 uskill.cn，通用性高。

---

### 方案 C：从 URL 导入（通用导入）

**改造**：

1. 新增 API：`/api/skills/install-from-url`
2. 参数：`{ url: "https://..." }`（支持 zip、tar.gz、或包含 SKILL.md 的目录的 zip）
3. 实现：下载 → 解压 → 校验含 `SKILL.md` → 复制到 `~/.openclaw/skills/<skill-name>/`
4. 前端：增加「从 URL 导入」按钮

**适用**：uskill.cn 若提供「导出/下载」链接，可直接使用。

**工作量**：中。

---

### 方案 D：手动迁移（零开发）

**步骤**：

1. 从 uskill.cn 下载技能（若支持）
2. 将技能文件夹复制到 `~/.openclaw/skills/<skill-name>/`
3. 重启 uskillcn 或等待 Gateway 重新加载技能

**限制**：依赖 uskill.cn 的下载能力，无应用内一键安装。

---

### 方案 E：uskill.cn 与 ClawHub 同步

**前提**：uskill.cn 与 ClawHub 达成合作，将技能同步到 ClawHub。

**效果**：uskillcn 无需改动，通过现有 ClawHub 搜索/安装即可使用 uskill.cn 技能。

**工作量**：取决于双方合作，非 uskillcn 单方能完成。

---

## 四、推荐实施顺序

1. **短期**：实现**方案 B（从 GitHub 安装）**
   - 与 Cursor 能力对齐
   - 不依赖 uskill.cn API
   - 若 uskill.cn 技能在 GitHub，用户可直接安装

2. **中期**：视 uskill.cn 能力，补充**方案 C（从 URL 导入）**
   - 若 uskill.cn 提供导出链接，可无缝支持

3. **长期**：若 uskill.cn 提供 API，再考虑**方案 A（多源集成）**
   - 在应用内直接搜索、浏览 uskill.cn 技能

---

## 五、方案 B 实现要点（从 GitHub 安装）

### 5.1 后端

```ts
// 伪代码：electron/gateway/skill-install.ts
async function installFromGitHub(params: { repo: string; path?: string }): Promise<void> {
  const { repo, path } = params;
  // 1. 解析 owner/repo
  // 2. 使用 GitHub API 或 git sparse-checkout 获取指定 path
  // 3. 若 path 指向单个技能目录，直接使用；若指向父目录，需识别含 SKILL.md 的子目录
  // 4. 复制到 workDir/skills/<skill-name>/
  // 5. 更新 .clawhub/lock.json（若需要）
}
```

### 5.2 前端

- 在 Skills 页「发现技能」区域增加「从 GitHub 安装」
- 输入框：`owner/repo` 或 `https://github.com/owner/repo`
- 可选：`path` 输入（如 `skills/my-skill`），用于多技能仓库

### 5.3 安全与校验

- 校验目标路径下存在 `SKILL.md`
- 校验 frontmatter 中 `name` 与目录名一致
- 限制下载大小与超时

---

## 六、uskill.cn 信息缺口

当前无法确认：

- uskill.cn 是否提供公开 API
- 技能存储方式（自建 / GitHub / 其他）
- 是否支持导出或下载链接

建议：联系 uskill.cn 团队获取 API 文档或导出能力说明，以便选择最合适的集成方案。

---

## 七、参考资料

- [Agent Skills 标准](https://agentskills.io)
- [Cursor Agent Skills 文档](https://cursor.com/docs/context/skills)
- [Clawdbot Skills 文档](https://clawdbot.com/docs/tools/skills)
- [ClawHub](https://clawhub.ai)
