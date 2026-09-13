# 第 03 节：初始化 NestJS 后端

## 本节目标

1. 使用官方 Nest CLI 创建 `backend/`。
2. 理解脚手架命令每个参数的作用。
3. 认识生成的入口文件、配置文件、源码和测试目录。
4. 运行默认单元测试、e2e 测试、Lint 和构建。
5. 保存一个尚未加入图书业务的纯净后端基线。

本节只生成并验证框架骨架。图书模块、TypeORM、SQLite 和 CRUD 都属于后续节点。

Nest CLI 在 Windows 上生成 CRLF 换行。项目新增根目录 `.gitattributes`，用 `* text=auto eol=lf` 让 Git 提交统一保存 LF，避免跨平台差异和行尾空白误报。

## 执行前检查

```powershell
git status --short
node --version
npm.cmd --version
```

本机结果：

```text
Git 工作区干净
Node.js v24.11.1
npm 11.6.2
```

PowerShell 尝试执行 `npm` 时优先找到了 `npm.ps1`，但系统执行策略禁止脚本运行。这里不修改系统安全策略，改用 Node.js 同时提供的 `npm.cmd` 和 `npx.cmd`。二者执行的仍是 npm/npx。

## 脚手架命令

```powershell
npx.cmd --yes @nestjs/cli@latest new backend --package-manager npm --skip-git --strict
```

逐段解释：

- `npx.cmd`：下载并临时执行 npm 包中的命令。
- `--yes`：自动确认 npx 对临时安装 CLI 的询问。
- `@nestjs/cli@latest`：使用 npm 当前提供的最新版 Nest CLI。
- `new backend`：在 `backend/` 中创建新应用。
- `--package-manager npm`：明确使用 npm，不让 CLI 再询问 pnpm/yarn。
- `--skip-git`：不在 `backend/` 内创建第二个 `.git`，继续使用根仓库。
- `--strict`：启用严格 TypeScript 检查，尽早发现类型问题。

## 实际生成版本

本次 npm 安装得到的主要版本：

```text
@nestjs/cli 12.0.0
@nestjs/common 12.0.1
@nestjs/core 12.0.1
@nestjs/platform-express 12.0.1
TypeScript 6.0.3
Vitest 4.1.11
Oxlint 1.82.0
```

NestJS 12 当前脚手架使用 Vitest 和 Oxlint，而不是许多旧教程中的 Jest 和 ESLint。判断项目实际使用什么工具，应以生成的 `backend/package.json` 为准。

## Node.js 兼容警告

安装期间 npm 报告：Nest CLI 的底层 `@angular-devkit` 希望 Node.js 满足 `^24.15.0`，当前环境是 `24.11.1`。这是 `EBADENGINE` 警告，不是安装失败。

本节随后运行的测试、Lint 和构建全部成功，说明当前骨架可以继续学习。但在长期开发环境中，建议把 Node 24 升级到至少 24.15.0，消除后续安装依赖时的兼容警告。升级 Node 不属于本节点，不能未经确认修改本机环境。

## 生成文件

忽略 `node_modules/`、`dist/` 和 `*.tsbuildinfo` 后，需要提交的后端结构是：

```text
backend/
├─ src/
│  ├─ main.ts
│  ├─ app.module.ts
│  ├─ app.controller.ts
│  ├─ app.controller.spec.ts
│  └─ app.service.ts
├─ test/
│  └─ app.e2e-spec.ts
├─ nest-cli.json
├─ oxlint.json
├─ package.json
├─ package-lock.json
├─ README.md
├─ tsconfig.json
├─ tsconfig.build.json
├─ vitest.config.ts
└─ vitest.config.e2e.ts
```

主要职责：

- `package.json`：依赖和 `start/test/lint/build` 命令入口。
- `package-lock.json`：锁定实际安装版本，保证其他机器安装结果可重复。
- `src/main.ts`：创建 Nest 应用并监听端口。
- `src/app.module.ts`：根模块，声明 Controller 和 Provider。
- `src/app.controller.ts`：接收默认 HTTP GET 请求。
- `src/app.service.ts`：返回默认的 `Hello World!`。
- `*.spec.ts`：单元测试；`test/*.e2e-spec.ts`：HTTP 端到端测试。
- `nest-cli.json`：Nest CLI 构建设置。
- `tsconfig*.json`：TypeScript 编译规则。
- `vitest.config*.ts`：单元测试和 e2e 测试配置。
- `oxlint.json`：静态代码检查配置。

根目录还新增 `.gitattributes`，它不改变 TypeScript 逻辑，只统一 Git 中的文本换行符。

## 默认启动调用链

当前源码的调用方向是：

```text
npm.cmd --prefix backend run start
  -> Nest CLI 编译 TypeScript
  -> 执行 src/main.ts 的 bootstrap()
  -> NestFactory.create(AppModule)
  -> AppModule 注册 AppController 与 AppService
  -> HTTP GET /
  -> AppController.getHello()
  -> AppService.getHello()
  -> 返回 "Hello World!"
```

第 06 节会逐行讲解这条调用链。本节只需要先知道入口与各文件的关系。

## 清除测试配置警告

初次测试成功，但 Vitest 提示 `vite-tsconfig-paths` 已多余，因为当前 Vite 原生支持 `resolve.tsconfigPaths`。本节进行了等价配置调整：

```typescript
resolve: {
  tsconfigPaths: true,
}
```

随后从开发依赖移除 `vite-tsconfig-paths`。再次运行测试时警告消失，行为没有变化。

## 验证命令与结果

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:e2e
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
```

验证结果：

- 单元测试：1 个测试文件、1 个测试通过。
- e2e 测试：1 个测试文件、1 个测试通过。
- Oxlint：通过，无错误。
- Nest build：通过，生成的 `dist/` 被 Git 忽略。
- `tsconfig.build.tsbuildinfo`：属于增量编译缓存，新增 `*.tsbuildinfo` 忽略规则。
- `git diff --cached --check`：使用 `.gitattributes` 规范化后不再报告 CRLF 行尾问题。

## 本节提交命令

```powershell
git add .gitattributes .gitignore README.md TODO.md docs/PROJECT_DESIGN.md backend docs/learning/03-nest-backend-scaffold.md
git commit -m "chore: 初始化 NestJS 后端（scaffold NestJS backend）"
```

下一节将创建 Vite + React + TypeScript 前端；不会在本节提前混入前端文件。
