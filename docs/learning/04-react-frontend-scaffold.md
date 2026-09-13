# 第 04 节：初始化 React 前端

## 本节目标

1. 使用 Vite 创建 `frontend/` React + TypeScript 项目。
2. 把“生成模板”和“安装依赖”理解为两个独立步骤。
3. 认识入口 HTML、React 入口、根组件和构建配置。
4. 运行 Oxlint、生产构建和真实开发服务器验证。
5. 保存尚未清理示例页面、尚未连接后端的前端基线。

本节不安装 Axios、不创建图书类型、不修改默认计数器。它们各自属于后续节点。

## 执行前检查

```powershell
git status --short
Test-Path frontend
```

执行前 Git 工作区干净，且 `frontend/` 不存在，因此不会覆盖已有前端代码。

## 第一步：生成 Vite 模板

```powershell
npx.cmd --yes create-vite@latest frontend --template react-ts
```

逐段解释：

- `npx.cmd`：在当前 Windows PowerShell 环境中执行 npm 包命令。
- `--yes`：自动确认临时下载 `create-vite`。
- `create-vite@latest`：使用 npm 当前提供的最新版 Vite 初始化器。
- `frontend`：目标目录名。
- `--template react-ts`：选择 React 与 TypeScript 模板。

这条命令只复制模板，不负责安装 `package.json` 中声明的依赖。

## 第二步：安装前端依赖

```powershell
npm.cmd --prefix frontend install
```

- `--prefix frontend`：把 `frontend/` 当作 npm 项目目录，不必先 `cd frontend`。
- `install`：读取 `frontend/package.json`，下载依赖并生成 `package-lock.json`。
- `node_modules/`：安装后的本地依赖，不提交 Git。
- `package-lock.json`：实际版本锁定文件，需要提交 Git。

## 实际安装版本

```text
React 19.3.0
React DOM 19.3.0
Vite 8.3.0
TypeScript 6.0.3
@vitejs/plugin-react 6.1.1
Oxlint 1.82.0
```

旧教程可能使用 React 18、Vite 5 或 ESLint。本项目以当前脚手架生成的 React 19、Vite 8 和 Oxlint 为准，不为了模仿旧教程主动降级。

## 生成文件

忽略 `node_modules/` 和 `dist/` 后，需要提交的结构是：

```text
frontend/
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
├─ src/
│  ├─ assets/
│  │  ├─ hero.png
│  │  ├─ react.svg
│  │  └─ vite.svg
│  ├─ App.css
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ .gitignore
├─ .oxlintrc.json
├─ index.html
├─ package.json
├─ package-lock.json
├─ README.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

主要职责：

- `index.html`：浏览器最先读取的 HTML，包含 `<div id="root">` 和 `/src/main.tsx` 脚本入口。
- `src/main.tsx`：找到 `#root`，创建 React 根节点并渲染 `<App />`。
- `src/App.tsx`：当前根组件，暂时显示 Vite 默认示例页面。
- `src/*.css`：默认全局样式和组件样式。
- `src/assets/`、`public/`：示例图片与无需打包导入的静态资源。
- `vite.config.ts`：注册 React 插件，让 Vite 能处理 React Fast Refresh 和 JSX。
- `tsconfig.app.json`：浏览器端 TS/TSX 规则。
- `tsconfig.node.json`：`vite.config.ts` 等 Node 环境配置的规则。
- `.oxlintrc.json`：前端静态检查配置。
- `package.json`：定义 `dev`、`build`、`lint`、`preview` 四个脚本。

## 当前启动调用链

```text
npm.cmd --prefix frontend run dev
  -> package.json 的 "dev": "vite"
  -> Vite 启动 5173 开发服务器
  -> 浏览器请求 index.html
  -> <script type="module" src="/src/main.tsx">
  -> main.tsx 找到 #root
  -> createRoot(...).render(<App />)
  -> App.tsx 返回 JSX
  -> React 更新浏览器 DOM
```

第 23 节会逐行解释 React 启动流程；当前只要求能够按顺序指出入口文件。

## 开发、检查与构建命令

启动开发服务器：

```powershell
npm.cmd --prefix frontend run dev
```

Vite 默认监听 `http://localhost:5173`，并提供 HMR。修改组件后通常无需手动重启。按 `Ctrl+C` 停止服务器。

运行代码检查：

```powershell
npm.cmd --prefix frontend run lint
```

运行生产构建：

```powershell
npm.cmd --prefix frontend run build
```

`build` 实际执行：

```text
tsc -b
  -> 检查多个 TypeScript 配置引用
vite build
  -> 转换 React 模块
  -> 生成 dist/ 静态资源
```

## 验证结果

- Oxlint：通过，无错误。
- TypeScript + Vite 构建：通过，共转换 20 个模块。
- 开发服务器：Vite 8.3.0 在 `127.0.0.1:5173` 启动成功。
- HTTP 请求：返回 `200`。
- HTML：包含 `id="root"`，页面标题当前为 `frontend`。
- 验证完成后开发服务器已停止，没有遗留后台进程。
- `frontend/node_modules/` 和 `frontend/dist/` 均被 Git 忽略。

## 为什么暂时保留默认页面

当前的图片、计数器和英文内容能够证明 React 状态、事件和资源导入都能工作。本节的目标是保存“官方模板可运行”的基线。清理模板是独立的第 24 节，届时能通过单独提交清楚看到删除了什么。

## 本节提交命令

```powershell
git add README.md TODO.md frontend docs/learning/04-react-frontend-scaffold.md
git commit -m "chore: 初始化 React 前端（scaffold React frontend）"
```

下一节将专门检查根目录和两个子项目的 Git 忽略规则，确保依赖、构建产物、环境变量和 SQLite 数据库不会进入历史。
