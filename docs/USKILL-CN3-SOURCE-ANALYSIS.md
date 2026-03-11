# uskill.cn3 源码分析

uskill.cn3 是 [uskill.cn](https://www.uskill.cn/) 的源码，本文档分析其架构、数据流与 ClawHub 集成可行性。

---

## 一、技术栈概览

| 维度 | 技术 |
|------|------|
| **框架** | Next.js 15（App Router） |
| **语言** | TypeScript |
| **样式** | Tailwind CSS |
| **数据库** | Vercel Postgres（Neon） |
| **部署** | Vercel |

---

## 二、数据架构

### 2.1 两张核心表

| 表名 | 用途 | 数据来源 |
|------|------|----------|
| `skills` | 技能详情（标题、描述、Markdown、标签） | 爬虫导入、用户提交 GitHub URL |
| `github_repos` | 最新热门 GitHub 仓库（README 摘要、Stars） | 定时 Cron 采集 |

### 2.2 技能数据结构（`skills.data`）

```json
{
  "url": null,
  "markdown": "完整 SKILL.md 内容",
  "metadata": {
    "sourceURL": "https://github.com/owner/repo/blob/main/path/SKILL.md",
    "title": "技能名称",
    "description": "英文描述",
    "shortDescZh": "简短中文说明",
    "tags": ["标签1", "标签2"],
    "scrapedAt": "2026-02-28T12:00:00.000Z"
  }
}
```

**关键点**：`metadata.sourceURL` 存的是 **GitHub 完整 URL**（含 owner/repo/ref/path），可直接用于下载。

### 2.3 GitHub 仓库数据结构（`github_repos.data`）

```json
{
  "full_name": "owner/repo",
  "html_url": "https://github.com/owner/repo",
  "description": "仓库描述",
  "topics": ["cursor", "skills"],
  "readme_excerpt": "README 前 300 字摘要",
  "stars": 100,
  "search_query": "cursor skills",
  "pushed_at": "2025-03-01T12:00:00Z"
}
```

---

## 三、数据流与 API

### 3.1 技能数据来源

| 来源 | 方式 | 文件/脚本 |
|------|------|-----------|
| **爬虫导入** | `skills_scrapy_output.json` → `yarn db:import` | `scripts/import-skills.ts` |
| **用户提交** | 用户粘贴 GitHub URL → 解析并存储 | `app/api/skills/submit/route.ts` |

### 3.2 用户提交流程（GitHub URL）

1. 用户提交：`POST /api/skills/submit`，body: `{ url: "https://github.com/owner/repo/blob/main/path/SKILL.md" }`
2. 解析：`parseGitHubUrl()` 支持 `github.com/.../blob/...` 和 `raw.githubusercontent.com/...`
3. 抓取：`fetchRawContent(parsed.rawUrl)` 从 GitHub raw 获取 Markdown
4. 解析：`parseSkillMarkdown()` 提取 title、description、tags（从关键词映射）
5. 去重：按 `sourceURL` 检查是否已存在
6. 存储：`INSERT INTO skills (data)`

### 3.3 GitHub 仓库采集（Cron）

- **触发**：`GET/POST /api/cron/collect-github`（可鉴权 `Authorization: Bearer CRON_SECRET`）
- **搜索**：`cursor skills`、`cursor rules`、`cursor agent` 等关键词
- **存储**：`github_repos` 表，`full_name` 唯一
- **定时**：Vercel Cron 每日 UTC 2:00

---

## 四、与 AgentSkills / ClawHub 的差异

### 4.1 格式差异

| 维度 | uskill.cn3 | 标准 AgentSkills / ClawHub |
|------|------------|---------------------------|
| **存储** | 单条 Markdown 存 DB，`metadata.sourceURL` 指向 GitHub | 技能目录 + SKILL.md 文件 |
| **YAML frontmatter** | 不解析，仅从 Markdown 提取 title/description | 必填 `name`、`description` |
| **安装** | 无安装能力，仅展示 + 跳转 GitHub | `clawhub install <slug>` 可安装 |

### 4.2 关键代码：`parseSkillMarkdown`

- 从 Markdown 提取：第一个 `#` 标题、前几段非空文本作为 description
- 用 `KEYWORD_MAP` 生成标签（文档、工作流、API、React 等）
- **不解析** YAML frontmatter，若技能有 `---` 块，可能无法正确提取 `name`/`description`

### 4.3 数据出口

- **技能列表**：`GET /api/skills?search=&tag=&page=`
- **优质技能**：`GET /api/skills/quality`
- **标签**：`GET /api/skills/tags`
- **GitHub 仓库**：`GET /api/peer-resources`

**无公开 API 返回**：技能下载 URL、slug、安装命令。前端仅展示卡片，点击跳转 `metadata.sourceURL`（GitHub）。

---

## 五、ClawHub 集成可行性

### 5.1 数据可获取性 ✅

| 数据 | 可用性 | 说明 |
|------|--------|------|
| **技能 GitHub URL** | ✅ | `metadata.sourceURL` 或 `metadata.url` |
| **技能 Markdown** | ✅ | `data.markdown` |

**结论**：uskill.cn3 的数据可直接用于 ClawHub 集成，无需爬虫。

### 5.2 集成方式

**方案 1：从 uskill.cn API 拉取 → 发布到 ClawHub**

1. 调用 `GET /api/skills`（或带分页）获取所有技能
2. 对每条技能：取 `metadata.sourceURL`，解析为 `owner/repo/ref/path`
3. 按 ClawHub 要求：下载完整技能目录（若只有单文件需构建目录结构）
4. 执行 `clawhub publish` 发布到 ClawHub

**方案 2：uskillcn 直接支持「从 GitHub 安装」**

1. 在 uskillcn Skills 页面增加「从 GitHub 安装」
2. 用户输入 `owner/repo` 或 `https://github.com/owner/repo/blob/main/path/SKILL.md`
3. 从 GitHub 下载并安装到 `~/.openclaw/skills/`（不依赖 ClawHub 注册表）

这样：uskill.cn 用户点击技能卡片 → 复制 GitHub URL → 在 uskillcn 中粘贴安装即可。

**方案 3：uskill.cn 增加「一键安装」按钮**

1. 在 uskill.cn3 技能卡片上增加「安装到 uskillcn」按钮
2. 按钮链接：`uskillcn://install?url=<encoded-github-url>` 或打开 uskillcn 并传入 URL
3. uskillcn 需支持 URL scheme 或 deep link 接收安装参数

---

## 六、改造量评估（uskill.cn3 → ClawHub）

| 任务 | 改造量 | 说明 |
|------|--------|------|
| **导出脚本** | 小 | 从 Postgres 查 `skills`，按 `sourceURL` 生成列表，供 ClawHub 发布脚本使用 |
| **YAML 解析** | 小 | 若需标准化，可增强 `parseSkillMarkdown` 解析 frontmatter |
| **ClawHub 发布** | 中 | 需：下载 GitHub 完整目录、校验 SKILL.md、执行 `clawhub publish` 并处理认证 |
| **自动化流水线** | 中 | 定时任务：拉取 uskill.cn 数据 → 发布到 ClawHub，需处理去重、版本 |

**整体**：若只做「数据导出 + 手动发布」，改造量小；若做「全自动同步到 ClawHub」，改造量中等。

---

## 七、关键文件索引

| 文件 | 用途 |
|------|------|
| `lib/github-skill.ts` | GitHub URL 解析、raw 抓取、Markdown 解析 |
| `lib/github-collect.ts` | GitHub 仓库搜索与采集 |
| `app/api/skills/route.ts` | 技能列表 API |
| `app/api/skills/submit/route.ts` | 用户提交 GitHub URL |
| `app/api/cron/collect-github/route.ts` | Cron 采集入口 |
| `app/api/peer-resources/route.ts` | GitHub 仓库列表 API |
| `scripts/import-skills.ts` | 批量导入 JSON |
| `scripts/schema.sql` | skills 表结构 |
| `scripts/schema-github-repos.sql` | github_repos 表结构 |

---

## 八、环境变量

| 变量 | 说明 |
|------|------|
| `POSTGRES_URL` | Neon 连接字符串 |
| `GITHUB_TOKEN` | GitHub API Token（提高限流） |
| `CRON_SECRET` | Cron 接口鉴权 |

---

## 九、总结

- **uskill.cn3** 是展示型平台，技能数据来自爬虫 + 用户提交，存于 Postgres。
- **核心资产**：`metadata.sourceURL` 指向 GitHub，可直接用于下载。
- **与 ClawHub 集成**：数据可获取，改造量小到中等；推荐优先实现 uskillcn「从 GitHub 安装」，再考虑与 uskill.cn 的深度联动。
