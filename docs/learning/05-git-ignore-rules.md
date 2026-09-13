# 第 05 节：检查并完善项目忽略文件

## 本节目标

1. 理解为什么有些本地文件不应该提交 Git。
2. 理解根目录与子目录 `.gitignore` 的生效范围。
3. 分清源码、依赖、构建产物、运行数据和本地配置。
4. 使用 Git 命令验证规则，而不是只凭肉眼判断。
5. 完成阶段一“项目初始化”。

本节不修改 NestJS 或 React 运行逻辑。

## 为什么需要 `.gitignore`

Git 仓库应该保存能够共同维护和复现项目的内容，例如：

- TypeScript、TSX 和 CSS 源码。
- `package.json` 与 `package-lock.json`。
- TypeScript、Vite、NestJS、Vitest 和 Oxlint 配置。
- README、TODO 和学习讲义。

以下内容不适合提交：

- `node_modules/`：体积大，可根据锁文件重新安装。
- `dist/`：可以根据源码重新构建。
- SQLite 数据文件：属于本机运行数据，每个人的内容不同。
- `.env`：可能包含本机地址、密码或密钥。
- 日志、编辑器配置和操作系统临时文件。

## 根规则与子目录规则

当前项目有两份规则文件：

```text
library-management/.gitignore
library-management/frontend/.gitignore
```

根 `.gitignore` 从项目根开始向下生效，因此 `node_modules/` 同时匹配：

```text
backend/node_modules/
frontend/node_modules/
```

`frontend/.gitignore` 只对 `frontend/` 内部生效。它由 Vite 脚手架生成，即使未来把前端单独拆成仓库，也保留合理的默认规则。

当多条规则同时匹配时，后出现且更具体的规则可以覆盖前面的规则。以 `!` 开头的规则表示重新包含，但如果父目录已经被完全忽略，子文件通常不能直接重新包含。

## 根 `.gitignore` 规则说明

依赖：

```gitignore
node_modules/
```

构建与测试输出：

```gitignore
dist/
coverage/
*.tsbuildinfo
```

本地环境变量：

```gitignore
.env
.env.local
.env.*.local
```

`.env.example` 没有被忽略，因为它只保存变量名称和安全示例值，后续需要提交给其他开发者参考。

SQLite 主文件和临时日志：

```gitignore
*.sqlite
*.sqlite-journal
*.sqlite-shm
*.sqlite-wal
*.db
*.db-journal
*.db-shm
*.db-wal
```

- `.sqlite`、`.db`：主数据库文件。
- `-journal`：SQLite 回滚日志。
- `-wal`：Write-Ahead Logging 文件。
- `-shm`：WAL 模式使用的共享内存文件。

日志、编辑器和系统文件：

```gitignore
*.log
npm-debug.log*
.idea/
.vscode/
.DS_Store
Thumbs.db
```

## 验证某个路径为什么被忽略

```powershell
git check-ignore -v backend/node_modules/example.js
git check-ignore -v frontend/dist/index.html
git check-ignore -v backend/data/library.sqlite
git check-ignore -v backend/data/library.sqlite-wal
git check-ignore -v backend/tsconfig.build.tsbuildinfo
git check-ignore -v frontend/.env.local
```

`-v` 会同时显示规则来源、行号、匹配规则和测试路径。例如：

```text
.gitignore:2:node_modules/ backend/node_modules/example.js
```

它说明路径被根 `.gitignore` 第 2 行的 `node_modules/` 匹配。

## 验证应该提交的文件没有被忽略

以下文件应当被跟踪：

```text
backend/package-lock.json
frontend/src/main.tsx
frontend/.env.example
```

运行：

```powershell
git check-ignore backend/package-lock.json frontend/src/main.tsx frontend/.env.example
```

没有输出且退出码为 1，表示这些路径没有命中忽略规则。这里的退出码 1 表示“没有匹配”，不是命令损坏。

## 检查是否有已跟踪文件违反规则

```powershell
git ls-files -ci --exclude-standard
```

参数含义：

- `git ls-files`：查看 Git 索引中的文件。
- `-c`：只看已缓存，也就是已经跟踪的文件。
- `-i`：只看同时被 ignore 规则匹配的文件。
- `--exclude-standard`：使用项目标准 `.gitignore` 规则。

预期没有输出。若有输出，说明文件在加入 Git 后才被忽略；`.gitignore` 不会自动把已经跟踪的文件移出索引。

## `git status --ignored` 的作用

```powershell
git status --short --ignored
```

常见标记：

```text
M   已跟踪文件发生修改
??  未跟踪且未忽略
!!  已被忽略
```

本项目应能看到 `backend/node_modules/`、`frontend/node_modules/` 和两个 `dist/` 显示为 `!!`，但它们不会出现在普通 `git status --short` 中。

## 本节验证标准

1. 后端和前端 `node_modules/` 被忽略。
2. 后端和前端 `dist/` 被忽略。
3. TypeScript 增量缓存被忽略。
4. `.env` 和本地变体被忽略，`.env.example` 不被忽略。
5. `.sqlite`、`.db` 及 journal/WAL/SHM 文件被忽略。
6. `package-lock.json` 和源码继续被跟踪。
7. 没有已经跟踪的文件违反当前忽略规则。

## 本节提交命令

```powershell
git add .gitignore README.md TODO.md docs/learning/05-git-ignore-rules.md
git commit -m "chore: 完善项目忽略规则（complete project ignore rules）"
```

提交后，阶段一“项目初始化”完成。下一节进入阶段二，逐行了解 NestJS 项目结构和默认请求调用链。
