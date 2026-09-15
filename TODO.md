# 图书管理教学项目 TODO

## 学习规则

- 严格按七个阶段和节点编号推进，不提前复制最终代码。
- 每个节点都必须写独立讲义，包含：目标、命令、生成文件、代码调用链、验证方法。
- CRUD 节点执行“先写失败测试 → 确认失败原因 → 写最小实现 → 测试通过”。
- 每个节点只创建一次独立 Git 提交，并用 `git show --stat HEAD` 检查范围。
- 提交信息保留 `feat/docs/chore/test/refactor/fix` 类型前缀，具体描述使用中文，随后用全角括号附英文说明。
- 后端使用 NestJS + TypeORM + SQLite；前端使用 Vite + React + TypeScript + Axios。
- 第一阶段只实现图书 CRUD 和前后端联调。

## 阶段一：项目初始化

- [x] **01 初始化本地 Git 仓库**
  - 目标：建立 `main` 分支仓库并理解工作区、暂存区和提交。
  - 命令：`git init -b main`、`git status`、`git add`、`git commit`。
  - 文件：`.git/`、`.gitignore`、`docs/learning/01-初始化本地Git仓库.md`。
  - 调用链：工作区 → 暂存区 → Git 提交 → Git 历史。
  - 验证：分支为 `main`，提交只包含本节点文件。
  - 提交：`chore: initialize local Git repository`

- [x] **02 创建项目说明和详细学习路线**
  - 目标：明确技术栈、七阶段范围、数据模型和学习纪律。
  - 命令：阅读 Markdown，使用 `git diff --cached --check` 检查文档。
  - 文件：`README.md`、`TODO.md`、`docs/PROJECT_DESIGN.md`、第 02 节讲义。
  - 调用链：README 项目入口 → TODO 节点导航 → Design 技术约定。
  - 验证：三份文档对 Axios、ISBN 唯一和阶段边界表述一致。
  - 提交：`docs: 添加项目路线与设计（add project roadmap and design）`

- [x] **03 初始化 NestJS 后端**
  - 目标：用 Nest CLI 在 `backend/` 创建可运行的后端脚手架。
  - 命令：`npx.cmd --yes @nestjs/cli@latest new backend --package-manager npm --skip-git --strict`。
  - 文件：`backend/package.json`、`backend/src/`、Nest、TypeScript、Vitest、Oxlint 配置。
  - 调用链：npm → Nest CLI → 模板文件 → 安装后端依赖。
  - 验证：`npm.cmd --prefix backend test` 和 `npm.cmd --prefix backend run build` 通过。
  - 提交：`chore: 初始化 NestJS 后端（scaffold NestJS backend）`

- [x] **04 初始化 React 前端**
  - 目标：用 Vite 在 `frontend/` 创建 React + TypeScript 脚手架。
  - 命令：`npx.cmd --yes create-vite@latest frontend --template react-ts`、`npm.cmd --prefix frontend install`。
  - 文件：`frontend/index.html`、`frontend/src/`、Vite、TypeScript、Oxlint 配置。
  - 调用链：npm create → Vite 模板 → React TypeScript 项目 → 安装依赖。
  - 验证：`npm.cmd --prefix frontend run lint` 和 `npm.cmd --prefix frontend run build` 通过。
  - 提交：`chore: 初始化 React 前端（scaffold React frontend）`

- [x] **05 检查并完善项目忽略文件**
  - 目标：理解根目录和子目录 `.gitignore` 的作用范围。
  - 命令：`git check-ignore -v`、`git status --ignored --short`。
  - 文件：根 `.gitignore`，必要时整理脚手架生成的忽略文件。
  - 调用链：文件路径 → Git ignore 规则匹配 → `git status` 是否显示。
  - 验证：`node_modules`、`dist`、`.env`、SQLite 文件均不会进入提交。
  - 提交：`chore: 完善项目忽略规则（complete project ignore rules）`

## 阶段二：后端基础

- [x] **06 了解 NestJS 项目结构**
  - 目标：理解 `main.ts`、Module、Controller、Service 的职责。
  - 命令：`npm.cmd --prefix backend run start:dev`，访问默认接口。
  - 文件：第 06 节讲义，只为解释调用链添加必要注释。
  - 调用链：`main.ts` → `AppModule` → `AppController` → `AppService`。
  - 验证：能解释并访问 `http://localhost:3000` 的默认响应。
  - 提交：`docs: 讲解 NestJS 项目结构（explain NestJS project structure）`

- [x] **07 安装和配置 TypeORM 基础依赖**
  - 目标：分清 Nest 适配包、ORM 和 SQLite 驱动。
  - 命令：在 `backend` 安装 `@nestjs/typeorm typeorm sqlite3`。
  - 文件：`backend/package.json`、`backend/package-lock.json`、讲义。
  - 调用链：Nest TypeORM 适配层 → TypeORM → sqlite3 驱动。
  - 验证：依赖树可解析，原有后端测试仍通过。
  - 提交：`chore: 安装 TypeORM 和 SQLite（install TypeORM and SQLite）`

- [x] **08 连接 SQLite 数据库**
  - 目标：让 Nest 启动时建立 SQLite 连接。
  - 命令：启动后端并检查数据库文件。
  - 文件：TypeORM 兼容版本、`app.module.ts` 数据源配置、数据库目录说明、讲义。
  - 调用链：`AppModule` → `TypeOrmModule.forRoot` → sqlite3 → 数据库文件。
  - 验证：应用无连接错误，SQLite 文件生成且被 Git 忽略。
  - 提交：`feat: 连接 SQLite 数据库（connect SQLite database）`

- [x] **09 创建图书模块**
  - 目标：为图书功能建立独立模块边界。
  - 命令：Nest CLI 分别生成 books module、controller、service。
  - 文件：`books.module.ts`、`books.controller.ts`、`books.service.ts` 及测试。
  - 调用链：`AppModule` 导入 `BooksModule` → 注册 Controller 与 Service。
  - 验证：应用能启动，新模块的默认测试通过。
  - 提交：`feat: 创建图书模块（create Books module）`

- [x] **10 定义图书数据模型**
  - 目标：理解 Entity、主键、普通列、时间列和唯一索引。
  - 命令：运行实体测试并启动应用同步表结构。
  - 文件：`book.entity.ts`、实体测试、讲义。
  - 调用链：Entity 装饰器 → TypeORM 元数据 → SQLite `book` 表。
  - 验证：表包含 id、title、author、isbn、publishedYear 和时间字段。
  - 提交：`feat: 定义图书实体（define Book entity）`

- [ ] **11 将 Book Repository 注入 Service**
  - 目标：理解 `forFeature`、Repository token 和构造器注入。
  - 命令：运行 BooksService 聚焦测试。
  - 文件：`books.module.ts`、`books.service.ts`、Service 测试、讲义。
  - 调用链：Nest 容器 → `Repository<Book>` → `BooksService`。
  - 验证：测试模块能创建 Service，Repository 依赖清楚可见。
  - 提交：`feat: 注入图书仓库（inject Book repository）`

- [ ] **12 创建新增图书 DTO**
  - 目标：定义 POST 请求允许接收的字段和校验规则。
  - 命令：安装 `class-validator class-transformer`，运行 DTO 测试。
  - 文件：`create-book.dto.ts`、DTO 测试、讲义。
  - 调用链：JSON 请求体 → class-transformer → `CreateBookDto`。
  - 验证：缺少 title/author、年份非法或 ISBN 过长都会失败。
  - 提交：`feat: 定义新增图书 DTO（define create book DTO）`

- [ ] **13 创建修改图书 DTO**
  - 目标：理解完整创建数据与部分更新数据的差异。
  - 命令：安装 `@nestjs/mapped-types`，运行修改 DTO 测试。
  - 文件：`update-book.dto.ts`、DTO 测试、讲义。
  - 调用链：`CreateBookDto` → `PartialType` → `UpdateBookDto`。
  - 验证：字段可以省略，但出现时仍必须符合原校验规则。
  - 提交：`feat: 定义修改图书 DTO（define update book DTO）`

- [ ] **14 配置请求参数验证**
  - 目标：启用全局 ValidationPipe、白名单和类型转换。
  - 命令：运行无效请求 e2e 失败测试，再配置管道并复测。
  - 文件：`main.ts`、验证 e2e 测试、讲义。
  - 调用链：HTTP body/param → ValidationPipe → DTO/number → Controller。
  - 验证：非法请求返回 `400`，额外字段被拒绝。
  - 提交：`feat: 校验 API 请求（validate API requests）`

## 阶段三：后端 CRUD

- [ ] **15 测试驱动实现新增图书接口**
  - 目标：只实现 `POST /api/books`。
  - 命令：先运行新增测试确认失败，再实现并复测。
  - 文件：Books Controller、Service、新增测试、讲义。
  - 调用链：POST → Controller `create` → Service `create` → Repository `save`。
  - 验证：返回 `201`、自增 ID、时间字段，数据库存在记录。
  - 提交：`feat: 实现新增图书接口（create books）`

- [ ] **16 测试驱动实现图书列表接口**
  - 目标：只实现 `GET /api/books`。
  - 命令：先运行列表测试确认失败，再实现并复测。
  - 文件：Books Controller、Service、列表测试、讲义。
  - 调用链：GET → Controller `findAll` → Service → Repository `find`。
  - 验证：空数据库返回 `[]`，有数据时返回图书数组。
  - 提交：`feat: 实现图书列表接口（list books）`

- [ ] **17 测试驱动实现单本图书查询接口**
  - 目标：只实现 `GET /api/books/:id` 的成功路径。
  - 命令：先运行详情测试确认失败，再实现并复测。
  - 文件：Books Controller、Service、详情测试、讲义。
  - 调用链：路径 id → Controller `findOne` → Service → Repository `findOneBy`。
  - 验证：存在的 ID 返回 `200` 和对应图书。
  - 提交：`feat: 实现单本图书查询接口（get book details）`

- [ ] **18 测试驱动实现修改图书接口**
  - 目标：只实现 `PATCH /api/books/:id` 的成功路径。
  - 命令：先运行修改测试确认失败，再实现并复测。
  - 文件：Books Controller、Service、修改测试、讲义。
  - 调用链：PATCH → 查询旧记录 → 合并字段 → Repository `save`。
  - 验证：只修改传入字段，`updatedAt` 发生变化。
  - 提交：`feat: 实现修改图书接口（update books）`

- [ ] **19 测试驱动实现删除图书接口**
  - 目标：只实现 `DELETE /api/books/:id` 的成功路径。
  - 命令：先运行删除测试确认失败，再实现并复测。
  - 文件：Books Controller、Service、删除测试、讲义。
  - 调用链：DELETE → Controller `remove` → Service → Repository `remove`。
  - 验证：成功返回 `204`，数据库记录消失。
  - 提交：`feat: 实现删除图书接口（delete books）`

- [ ] **20 处理图书不存在**
  - 目标：统一详情、修改、删除的 `404 Not Found` 行为。
  - 命令：先运行三个不存在场景的失败测试，再添加异常处理。
  - 文件：Books Service、错误场景测试、讲义。
  - 调用链：Repository 未找到 → `NotFoundException` → Nest HTTP `404`。
  - 验证：三个接口都返回一致且可读的 `404` 响应。
  - 提交：`feat: 处理图书不存在（handle missing books）`

- [ ] **21 处理 ISBN 重复**
  - 目标：新增或修改时阻止非空 ISBN 重复。
  - 命令：先运行新增与修改冲突测试，再实现检查。
  - 文件：Book Entity/Service、冲突测试、讲义。
  - 调用链：ISBN 输入 → 重复查询/唯一约束 → `ConflictException` → `409`。
  - 验证：重复 ISBN 返回 `409`，原记录不被修改。
  - 提交：`feat: 阻止 ISBN 重复（prevent duplicate ISBN values）`

- [ ] **22 测试所有后端接口**
  - 目标：使用真实 Nest 测试应用和测试 SQLite 串联完整 CRUD。
  - 命令：运行 e2e、全部 Vitest、Oxlint 和后端 build。
  - 文件：CRUD e2e 测试、测试数据库配置、讲义。
  - 调用链：HTTP → Validation → Controller → Service → TypeORM → 测试 SQLite。
  - 验证：成功、400、404、409 场景全部通过。
  - 提交：`test: 覆盖后端 CRUD 接口（cover backend CRUD API）`

## 阶段四：前端基础

- [ ] **23 了解 React 项目结构**
  - 目标：理解 `index.html`、`main.tsx` 和 `App.tsx` 的启动关系。
  - 命令：`npm.cmd --prefix frontend run dev`，查看浏览器和控制台。
  - 文件：第 23 节讲义，只添加解释所需注释。
  - 调用链：浏览器 → `index.html#root` → `main.tsx` → `<App />`。
  - 验证：能指出 React 挂载点并解释 StrictMode。
  - 提交：`docs: 讲解 React 启动流程（explain React startup flow）`

- [ ] **24 清理脚手架示例代码**
  - 目标：移除计数器和 Logo，只保留图书管理页面骨架。
  - 命令：运行前端 dev、Lint 和 build。
  - 文件：`App.tsx`、`App.css`、`index.css`，删除不再使用的图片。
  - 调用链：App 渲染 → 页面标题与空内容区域 → 浏览器 DOM。
  - 验证：默认计数器消失，页面显示“图书管理系统”。
  - 提交：`refactor: 精简 React 初始页面（simplify React starter page）`

- [ ] **25 定义图书 TypeScript 类型**
  - 目标：分别描述后端 Book、创建输入和修改输入。
  - 命令：运行 TypeScript build，演示并修复一次类型错误。
  - 文件：`src/types/book.ts`、类型说明讲义。
  - 调用链：后端 JSON 契约 → TypeScript 类型 → API 和组件使用。
  - 验证：缺少必填创建字段时编译失败，正确对象能通过。
  - 提交：`feat: 定义前端图书类型（define frontend Book types）`

- [ ] **26 安装并配置 Axios**
  - 目标：理解 Axios 实例、baseURL、超时和响应数据。
  - 命令：`npm.cmd --prefix frontend install axios`，运行依赖和 build 检查。
  - 文件：前端依赖清单、`src/api/http.ts`、Axios 配置测试、讲义。
  - 调用链：业务 API → Axios 实例 → HTTP 请求 → Promise 响应。
  - 验证：Axios 实例读取配置并能构造正确 URL。
  - 提交：`chore: 配置 Axios 客户端（configure Axios client）`

- [ ] **27 创建统一的图书 API 调用层**
  - 目标：组件不直接调用 Axios，只调用类型安全的图书函数。
  - 命令：先运行 API 层失败测试，再实现五个函数。
  - 文件：`src/api/books.ts`、`books.test.ts`、讲义。
  - 调用链：组件 → `list/create/get/update/deleteBook` → Axios。
  - 验证：每个函数的方法、路径、参数和返回类型正确。
  - 提交：`feat: 添加图书 API 调用层（add books API layer）`

- [ ] **28 配置后端接口地址**
  - 目标：用 Vite 环境变量区分源代码和本地地址配置。
  - 命令：创建 `.env.development`，运行 dev 和 build 检查。
  - 文件：`.env.example`、`.env.development`、`vite-env.d.ts`、讲义。
  - 调用链：`VITE_API_BASE_URL` → Axios `baseURL` → Nest `/api`。
  - 验证：开发环境目标为 `http://localhost:3000/api`，密钥不写入前端变量。
  - 提交：`chore: 配置后端接口地址（configure backend API URL）`

## 阶段五：前端 CRUD

- [ ] **29 测试驱动实现图书列表页面**
  - 目标：只读取并展示图书，不加入表单操作。
  - 命令：先运行组件失败测试，再实现并复测。
  - 文件：`BookList.tsx`、App 列表状态、测试、讲义。
  - 调用链：App 挂载 → `listBooks` → state → BookList → DOM。
  - 验证：能展示多本图书，空列表显示明确提示。
  - 提交：`feat: 展示图书列表（display book list）`

- [ ] **30 测试驱动实现新增图书表单**
  - 目标：填写表单、提交 POST，并把新书加入列表。
  - 命令：先运行表单交互失败测试，再实现并复测。
  - 文件：`BookForm.tsx`、创建状态、测试、讲义。
  - 调用链：输入 → submit → `createBook` → Axios POST → 更新 state。
  - 验证：新增成功后表单清空，列表出现新记录。
  - 提交：`feat: 从前端新增图书（create books from frontend）`

- [ ] **31 测试驱动实现编辑图书功能**
  - 目标：选择记录、回填表单、提交 PATCH。
  - 命令：先运行编辑失败测试，再实现并复测。
  - 文件：列表编辑按钮、表单编辑模式、测试、讲义。
  - 调用链：点击编辑 → 回填 → `updateBook` → Axios PATCH → 更新 state。
  - 验证：未修改字段保留，修改字段同步到列表。
  - 提交：`feat: 从前端编辑图书（edit books from frontend）`

- [ ] **32 测试驱动实现删除图书功能**
  - 目标：先实现删除请求和成功后的列表更新，不加确认框。
  - 命令：先运行删除失败测试，再实现并复测。
  - 文件：删除按钮、删除状态、测试、讲义。
  - 调用链：点击删除 → `deleteBook` → Axios DELETE → 过滤 state。
  - 验证：删除成功后该记录从列表消失。
  - 提交：`feat: 从前端删除图书（delete books from frontend）`

- [ ] **33 添加加载状态**
  - 目标：让首次查询和提交中的异步过程可见。
  - 命令：运行延迟 Promise 场景的组件测试。
  - 文件：App、BookForm、加载状态测试、讲义。
  - 调用链：Promise pending → loading/submitting state → 提示与按钮禁用。
  - 验证：加载中有提示，提交按钮不会重复发送请求。
  - 提交：`feat: 展示前端加载状态（show frontend loading states）`

- [ ] **34 添加错误提示**
  - 目标：展示后端 400、404、409 和网络错误，并允许重试。
  - 命令：运行 Axios 拒绝场景的组件测试。
  - 文件：错误转换函数、提示组件、测试、讲义。
  - 调用链：Axios error → API 层转换 → error state → 可见提示。
  - 验证：失败时表单内容保留，成功重试后错误消失。
  - 提交：`feat: 展示前端错误信息（display frontend errors）`

- [ ] **35 添加删除确认**
  - 目标：避免误删，并区分取消和确认路径。
  - 命令：先运行两个交互失败测试，再实现确认逻辑。
  - 文件：删除确认逻辑、测试、讲义。
  - 调用链：点击删除 → confirm → 取消或调用 `deleteBook`。
  - 验证：取消时不请求接口，确认时只请求一次。
  - 提交：`feat: 添加图书删除确认（confirm book deletion）`

## 阶段六：前后端联调

- [ ] **36 配置 NestJS 跨域访问**
  - 目标：理解浏览器同源策略和 CORS 响应头。
  - 命令：以前端 Origin 请求后端并检查响应头。
  - 文件：`backend/src/main.ts`、CORS 测试、讲义。
  - 调用链：浏览器 Origin → Nest CORS 配置 → Access-Control 响应头。
  - 验证：允许 `http://localhost:5173`，不使用无限制生产配置。
  - 提交：`chore: 配置本地跨域访问（configure local CORS）`

- [ ] **37 跑通前端查询接口**
  - 目标：用真实 Axios GET 从 SQLite 读取列表。
  - 命令：同时启动前后端，打开浏览器并检查 Network。
  - 文件：查询联调讲义和必要的小范围配置修正。
  - 调用链：React → Axios GET → Nest → TypeORM → SQLite → 列表。
  - 验证：浏览器展示后端真实数据，刷新后结果一致。
  - 提交：`test: 联调图书查询（integrate book queries）`

- [ ] **38 跑通前端新增接口**
  - 目标：从浏览器表单把真实记录写入 SQLite。
  - 命令：启动双端并提交一条新书数据。
  - 文件：新增联调讲义和必要修正。
  - 调用链：BookForm → Axios POST → Nest create → SQLite → React state。
  - 验证：新增后显示记录，刷新页面后仍存在。
  - 提交：`test: 联调图书新增（integrate book creation）`

- [ ] **39 跑通前端修改接口**
  - 目标：从浏览器修改 SQLite 中的真实记录。
  - 命令：启动双端并编辑刚新增的图书。
  - 文件：修改联调讲义和必要修正。
  - 调用链：编辑表单 → Axios PATCH → Nest update → SQLite → 列表。
  - 验证：刷新后仍显示修改值，`updatedAt` 已变化。
  - 提交：`test: 联调图书修改（integrate book updates）`

- [ ] **40 跑通前端删除接口**
  - 目标：从浏览器删除 SQLite 中的真实记录。
  - 命令：启动双端并确认删除目标图书。
  - 文件：删除联调讲义和必要修正。
  - 调用链：确认删除 → Axios DELETE → Nest remove → SQLite → 列表。
  - 验证：刷新后记录仍不存在，再查详情返回 `404`。
  - 提交：`test: 联调图书删除（integrate book deletion）`

- [ ] **41 验证刷新后数据仍然存在**
  - 目标：理解 React 内存状态与 SQLite 持久数据的区别。
  - 命令：新增数据、刷新、重启前后端、再次查询。
  - 文件：持久化验证讲义，不增加业务功能。
  - 调用链：SQLite 文件 → 后端查询 → HTTP → React 重新建立 state。
  - 验证：浏览器刷新和服务重启后，未删除记录仍存在。
  - 提交：`docs: 验证 SQLite 持久化（verify SQLite persistence）`

## 阶段七：检查与总结

- [ ] **42 运行并整理后端测试**
  - 目标：确认单元测试和 e2e 测试可重复执行。
  - 命令：运行 backend test、test:e2e、test:cov。
  - 文件：测试运行说明和必要的测试修正。
  - 调用链：Vitest → 测试模块/应用 → 被测行为 → 断言。
  - 验证：测试全部通过，输出没有未处理异常。
  - 提交：`test: 验证后端测试套件（verify backend test suite）`

- [ ] **43 运行前端代码检查**
  - 目标：统一执行前端测试、TypeScript 和 ESLint 检查。
  - 命令：运行 frontend test、lint 和 TypeScript build。
  - 文件：前端检查说明和必要修正。
  - 调用链：源码 → Vitest/TypeScript/ESLint → 检查结果。
  - 验证：三类检查全部通过。
  - 提交：`test: 验证前端代码检查（verify frontend quality checks）`

- [ ] **44 构建后端项目**
  - 目标：验证 TypeScript 后端可编译为 Node.js 产物。
  - 命令：`npm.cmd --prefix backend run build`，检查 `backend/dist`。
  - 文件：后端构建讲义，不提交 `dist`。
  - 调用链：TypeScript 源码 → Nest build → JavaScript dist。
  - 验证：构建成功，产物被 Git 忽略。
  - 提交：`docs: 验证后端生产构建（verify backend production build）`

- [ ] **45 构建前端项目**
  - 目标：验证 React 前端可生成浏览器静态资源。
  - 命令：`npm.cmd --prefix frontend run build`，检查 `frontend/dist`。
  - 文件：前端构建讲义，不提交 `dist`。
  - 调用链：TSX/CSS → TypeScript/Vite → HTML/CSS/JS 静态资源。
  - 验证：构建成功，产物被 Git 忽略。
  - 提交：`docs: 验证前端生产构建（verify frontend production build）`

- [ ] **46 手动验证完整 CRUD 流程**
  - 目标：从用户视角完成新增、列表、详情、修改、删除和错误场景。
  - 命令：启动双端，按验收清单操作并查看 Network。
  - 文件：手动验收清单和结果记录。
  - 调用链：浏览器 → React → Axios → Nest → TypeORM → SQLite。
  - 验证：所有正常和关键异常路径符合 API 设计。
  - 提交：`test: 记录手动 CRUD 验证（record manual CRUD verification）`

- [ ] **47 完善项目启动说明**
  - 目标：让初学者从全新安装状态启动两个应用。
  - 命令：重新安装依赖并按 README 启动。
  - 文件：`README.md`、故障排查说明。
  - 调用链：安装依赖 → 启动后端 → 启动前端 → 浏览器访问。
  - 验证：README 包含端口、命令、数据库位置和常见错误。
  - 提交：`docs: 完善项目启动说明（complete project startup guide）`

- [ ] **48 总结前后端接口调用链**
  - 目标：能逐层解释一次 CRUD 请求经过的文件和数据变化。
  - 命令：结合浏览器 Network、后端日志和 SQLite 数据复盘。
  - 文件：完整调用链总结讲义。
  - 调用链：事件 → 组件 → API → Axios → Controller → Service → Repository → SQLite。
  - 验证：每个箭头都能指向具体文件、函数、输入和输出。
  - 提交：`docs: 讲解完整前后端调用链（explain full stack request flow）`

- [ ] **49 创建阶段完成提交**
  - 目标：检查第一阶段范围、提交历史和干净工作区。
  - 命令：运行所有检查，查看 `git log --oneline --reverse` 和 `git status`。
  - 文件：更新 README、TODO 和第一阶段完成记录。
  - 调用链：49 个学习节点 → Git 历史 → 第一阶段稳定基线。
  - 验证：所有节点已勾选、检查通过、工作区无未提交变化。
  - 提交：`docs: 完成第一阶段教学项目（complete phase one tutorial）`
