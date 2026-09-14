# 第 09 节：创建图书模块

## 本节目标

这一节只完成一件事：为图书功能建立独立的 NestJS 模块边界。

学完后需要能够回答：

1. 为什么不把所有功能继续写进 `AppModule`。
2. Module、Controller 和 Service 在图书功能中分别负责什么。
3. `imports`、`controllers` 和 `providers` 三个数组分别注册什么。
4. Nest CLI 生成三个组件时分别创建和修改了哪些文件。
5. 为什么生成空 Controller 和空 Service 仍然有意义。
6. 为什么本项目的相对导入路径需要补 `.js` 后缀。

本节不会创建 Book Entity、定义数据库字段、注入 Repository、创建 DTO、配置 ValidationPipe 或实现任何 CRUD。创建“功能骨架”和实现“业务功能”是两个不同学习节点。

## 一、前置知识

### 1. 根模块与功能模块

NestJS 从根模块 `AppModule` 启动。前面只有脚手架默认功能时，Controller 和 Service 可以直接注册在根模块中：

```text
AppModule
├─ AppController
└─ AppService
```

随着项目增加图书、用户、借阅等功能，如果全部堆在 `AppModule` 中，根模块会越来越难阅读和维护。因此 NestJS 通常按业务领域拆成功能模块：

```text
AppModule
├─ TypeOrmModule
└─ BooksModule
   ├─ BooksController
   └─ BooksService
```

`AppModule` 只需要知道“应用包含图书功能”，图书功能内部如何组织则由 `BooksModule` 管理。

### 2. 三种组件的职责

- Module（模块）：组织一组相关能力，声明当前功能拥有哪些 Controller 和 Provider，以及依赖哪些其他模块。
- Controller（控制器）：以后负责接收与图书有关的 HTTP 请求，并把业务工作交给 Service。
- Service（服务）：以后负责组织图书业务步骤，并通过 Repository 访问数据库。

本节只创建结构。它们未来的完整调用链是：

```text
HTTP 请求
  -> BooksController
  -> BooksService
  -> Repository<Book>
  -> TypeORM
  -> SQLite
```

当前还没有 Entity 和 Repository，所以本节的实际链路只完成到模块注册。

## 二、开始前检查

在项目根目录执行：

```powershell
git status --short
git branch --show-current
git remote -v
```

命令含义：

- `git status --short`：确认没有上一节遗留的未提交修改。
- `git branch --show-current`：确认当前分支仍是 `main`。
- `git remote -v`：确认后续推送目标仍是 `origin`。

本节开始时，本地 `main` 与 `origin/main` 都位于：

```text
52a4a4d feat: 连接 SQLite 数据库（connect SQLite database）
```

工作区没有未提交文件。

## 三、先用 dry run 检查生成路径

Nest CLI 的 `generate` 命令会创建文件，并可能自动修改现有 Module。正式生成前先执行：

```powershell
npm.cmd --prefix backend exec -- nest generate module books --dry-run
```

命令可以分为：

```text
npm.cmd
  -> Windows 中的 npm 命令文件
  -> --prefix backend：使用 backend 项目安装的工具和依赖
  -> exec：执行项目依赖提供的命令
  -> --：npm 参数到此结束，后面交给被执行命令
  -> nest：运行本地 Nest CLI
  -> generate：生成 Nest 组件
  -> module：组件类型为 Module
  -> books：组件名称和目录名
  -> --dry-run：只预览，不写入文件
```

实际预览显示：

```text
CREATE books/books.module.ts
```

这说明 `npm --prefix backend exec` 会使用后端的 Nest CLI，但当前进程仍从仓库根目录解释生成路径。直接使用 `books` 会把目录放错位置。

因此正式命令明确写出相对于仓库根目录的路径：

```text
backend/src/books
```

再次 dry run 后，CLI 显示目标是 `backend/src/books/`，并能找到需要更新的 `backend/src/app.module.ts`。先预览可以避免生成错误后再删除文件。

## 四、生成 BooksModule

在项目根目录执行：

```powershell
npm.cmd --prefix backend exec -- nest generate module backend/src/books
```

其中：

- `module` 告诉 CLI 生成 Nest 模块。
- `backend/src/books` 同时指定生成位置和功能名称。
- CLI 使用名称生成 `BooksModule` 类和 `books.module.ts` 文件。
- CLI 找到上一级的 `AppModule`，自动导入并注册 `BooksModule`。

生成的 `backend/src/books/books.module.ts` 最初只有：

```typescript
import { Module } from '@nestjs/common';

@Module({})
export class BooksModule {}
```

这里的 `@Module({})` 是装饰器。它紧挨着 `BooksModule` 类，为 Nest 提供模块元数据。类体虽然为空，但 Nest 仍能通过装饰器知道这是一个模块。

同时，`AppModule` 的 `imports` 增加了 `BooksModule`：

```typescript
imports: [
  TypeOrmModule.forRoot({
    // SQLite 连接配置
  }),
  BooksModule,
],
```

`imports` 表示 `AppModule` 依赖哪些其他模块。放入 `BooksModule` 后，Nest 启动根模块时会继续进入图书功能模块，读取其中注册的组件。

## 五、生成 BooksController

执行：

```powershell
npm.cmd --prefix backend exec -- nest generate controller backend/src/books
```

`controller` 指定生成 Controller。命令完成三件事：

1. 创建 `books.controller.ts`。
2. 创建 `books.controller.spec.ts` 基础测试。
3. 自动把 `BooksController` 注册到 `BooksModule.controllers`。

Controller 当前代码是：

```typescript
import { Controller } from '@nestjs/common';

@Controller('books')
export class BooksController {}
```

`@Controller('books')` 表示这个控制器属于 `books` 路径空间。不过类中还没有 `@Get()`、`@Post()` 等处理方法，因此它现在不会产生可请求的图书接口。

项目设计中的最终接口位于 `/api/books`。本节既不配置全局 `/api` 前缀，也不添加具体路由；这里只保留 CLI 生成的 `books` 控制器前缀，后续接口节点再按计划完成 HTTP 行为。

`BooksModule` 此时增加：

```typescript
controllers: [BooksController],
```

`controllers` 专门保存由当前模块管理的 Controller。它们负责接收 HTTP 请求，不应放进 `providers`。

## 六、生成 BooksService

执行：

```powershell
npm.cmd --prefix backend exec -- nest generate service backend/src/books
```

`service` 指定生成 Service。命令同样完成三件事：

1. 创建 `books.service.ts`。
2. 创建 `books.service.spec.ts` 基础测试。
3. 自动把 `BooksService` 注册到 `BooksModule.providers`。

Service 当前代码是：

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class BooksService {}
```

`@Injectable()` 告诉 Nest：这个类可以由依赖注入容器创建和管理。它通常被称为 Provider（提供者）。

只有装饰器还不够，模块还需要注册它：

```typescript
providers: [BooksService],
```

因此两部分配合起来：

```text
@Injectable()
  -> 声明 BooksService 可以参与依赖注入

BooksModule.providers
  -> 把 BooksService 注册到当前模块的依赖注入范围
```

本节没有给 Service 添加方法，也没有在 Controller 中注入它。Repository 注入属于第 11 节，CRUD 业务方法属于第 15 节以后。

## 七、修正 ESM 相对导入

Nest CLI 生成的相对导入默认没有扩展名，例如：

```typescript
import { BooksModule } from './books/books.module';
```

当前后端 `package.json` 包含：

```json
"type": "module"
```

项目现有源码也统一使用 `.js` 结尾的相对导入。TypeScript 编译 ESM 源码时，源码中的 `.js` 会指向构建后真实存在的 JavaScript 文件。因此本节把新生成的相对导入改成：

```typescript
import { BooksModule } from './books/books.module.js';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
```

测试文件中的相对导入也采用相同规则。包导入如 `@nestjs/common` 不需要添加 `.js`，因为它由 Node.js 按包名解析。

这个修正没有增加业务功能，只是让 CLI 生成结果符合项目已有模块格式，并确保构建和运行时都能找到文件。

## 八、最终模块关系

`backend/src/books/books.module.ts` 最终内容是：

```typescript
import { Module } from '@nestjs/common';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
```

三个重要数组现在可以这样区分：

```text
AppModule.imports
  -> 导入 TypeOrmModule 和 BooksModule

BooksModule.controllers
  -> 注册负责接收图书 HTTP 请求的 BooksController

BooksModule.providers
  -> 注册负责图书业务逻辑的 BooksService
```

`BooksModule` 当前没有 `imports`，因为还没有导入 Entity 对应的 TypeORM 功能模块；也没有 `exports`，因为当前没有其他模块需要使用 `BooksService`。

## 九、基础测试在验证什么

### 1. Controller 测试

`books.controller.spec.ts` 创建一个只包含 `BooksController` 的测试模块：

```typescript
const module: TestingModule = await Test.createTestingModule({
  controllers: [BooksController],
}).compile();

controller = module.get<BooksController>(BooksController);
```

调用链是：

```text
Test.createTestingModule
  -> 注册 BooksController
  -> compile() 编译测试模块
  -> module.get(...) 从测试容器取得实例
  -> expect(...).toBeDefined() 确认实例存在
```

它还不测试 HTTP 请求，因为 Controller 中没有路由处理方法。

### 2. Service 测试

`books.service.spec.ts` 使用相同方式把 `BooksService` 放进 `providers`：

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [BooksService],
}).compile();

service = module.get<BooksService>(BooksService);
```

这个测试证明 `BooksService` 可以由 Nest 测试容器创建。当前它没有 Repository 依赖，因此不需要 mock 数据库。第 11 节注入 Repository 后，测试模块也必须提供对应依赖。

## 十、应用启动时的调用链

本节完成后，启动过程是：

```text
backend/src/main.ts
  -> NestFactory.create(AppModule)
  -> AppModule.imports
     -> TypeOrmModule 初始化 SQLite 数据源
     -> BooksModule 注册图书功能边界
        -> BooksController 加入 controllers
        -> BooksService 加入 providers
  -> Nest 依赖注入容器创建组件实例
  -> 原有 AppController 继续提供 GET /
  -> 应用监听 3000 端口
```

需要特别注意：

```text
模块成功注册 ≠ 图书接口已经实现
```

`BooksController` 没有路由方法，`BooksService` 没有业务方法，所以访问 `/books` 仍不会得到图书数据。本节只证明模块结构能够被 Nest 加载。

## 十一、本节新增或修改的文件

```text
backend/src/app.module.ts
  -> 导入 BooksModule，并把它加入 imports

backend/src/books/books.module.ts
  -> 声明图书功能模块，注册 Controller 和 Service

backend/src/books/books.controller.ts
  -> 声明空的图书 Controller

backend/src/books/books.controller.spec.ts
  -> 验证测试容器可以创建 BooksController

backend/src/books/books.service.ts
  -> 声明空的图书 Service

backend/src/books/books.service.spec.ts
  -> 验证测试容器可以创建 BooksService

docs/learning/09-create-books-module.md
  -> 保存本节完整讲义

README.md
  -> 更新已完成节点、下一节和最新讲义链接

TODO.md
  -> 勾选第 09 节
```

数据库文件仍然是运行时文件，并被 Git 忽略。本节不会改变 `backend/data/library.sqlite` 的表结构，因为没有新增 Entity。

## 十二、自动验证

### 1. 运行全部后端单元测试

```powershell
npm.cmd --prefix backend test
```

预期包括三个测试文件：

- 原有 `AppController` 测试。
- 新增 `BooksController` 基础测试。
- 新增 `BooksService` 基础测试。

三个测试都应通过。

### 2. 运行端到端测试

```powershell
npm.cmd --prefix backend run test:e2e
```

端到端测试导入完整 `AppModule`，因此会同时加载 `TypeOrmModule` 和 `BooksModule`。原有 `GET /` 应继续返回 `Hello World!`。

### 3. 运行代码检查

```powershell
npm.cmd --prefix backend run lint
```

它会检查 `src/` 与 `test/` 中的代码。新文件必须符合现有 Oxlint 规则。

### 4. 构建后端

```powershell
npm.cmd --prefix backend run build
```

它验证 Module、Controller、Service 之间的导入路径和 TypeScript 类型正确。构建产物 `backend/dist/` 仍被 Git 忽略。

## 十三、手动验证

在项目根目录启动后端：

```powershell
npm.cmd --prefix backend run start:dev
```

启动日志中应出现类似内容：

```text
BooksModule dependencies initialized
BooksController {/books}
Nest application successfully started
```

`BooksController {/books}` 表示 Nest 已发现这个 Controller 的路径空间；由于其中没有方法，不会出现 `Mapped {/books, GET}` 之类的具体路由日志。

另开 PowerShell 验证原接口：

```powershell
$response = Invoke-WebRequest http://localhost:3000/
$response.StatusCode
$response.Content
```

预期结果：

```text
200
Hello World!
```

验证结束后回到服务终端按 `Ctrl+C`，并确认没有进程继续占用 3000 端口。

## 十四、常见错误

### 1. 文件生成到了仓库根目录的 `books/`

原因是误以为 `npm --prefix backend exec` 会自动改变 Nest CLI 的路径解析起点。本环境需要在生成名称中明确写 `backend/src/books`。先使用 `--dry-run` 可以在不写文件的情况下发现问题。

### 2. `Cannot find module './books/books.module'`

当前后端采用 ESM。检查新生成的相对导入是否带 `.js` 后缀，并运行 build 验证。不要给 `@nestjs/common` 这样的包导入添加 `.js`。

### 3. 创建了文件却没有注册到 Module

Controller 必须出现在 `controllers`，Service 必须出现在 `providers`，功能模块必须出现在上级模块的 `imports`。只创建类文件不会让 Nest 自动加载它。

### 4. 访问 `/books` 得到 404

这是本节的正常结果。`@Controller('books')` 只声明控制器前缀；只有添加带 `@Get()`、`@Post()` 等装饰器的方法，Nest 才会映射具体请求。CRUD 会在后续节点逐项实现。

### 5. 提前在 Controller 中注入 Service

本节只建立模块边界。Controller 调用 Service 的具体方法会和 CRUD 接口一起学习，现在没有业务方法需要调用。

### 6. 提前加入 `TypeOrmModule.forFeature(...)`

`forFeature(...)` 用于向功能模块注册 Entity 对应的 Repository。当前还没有 Book Entity；第 10 节先定义数据模型，第 11 节再专门学习 Repository 注入。

## 十五、本节验收标准

1. `AppModule.imports` 包含 `BooksModule`。
2. `BooksModule` 注册 `BooksController` 和 `BooksService`。
3. Controller 与 Service 的基础测试能够通过。
4. 完整后端应用能够启动，并加载 `BooksModule`。
5. 原有 `GET /` 仍返回状态码 `200` 和 `Hello World!`。
6. 单元测试、端到端测试、代码检查和构建全部通过。
7. 没有 Entity、Repository、DTO、ValidationPipe 或 CRUD 实现。
8. Git 提交只包含第 09 节相关文件。

## 十六、本节提交命令

提交前只暂存本节文件：

```powershell
git add README.md TODO.md backend/src/app.module.ts backend/src/books docs/learning/09-create-books-module.md
```

检查暂存内容：

```powershell
git diff --cached --check
git diff --cached --name-only
```

确认没有 Entity、SQLite 数据库、`node_modules`、`dist` 或无关修改后提交：

```powershell
git commit -m "feat: 创建图书模块（create Books module）"
```

提交后检查并推送：

```powershell
git status --short
git show --stat --oneline HEAD
git push
```

下一节是第 10 节：定义图书数据模型。只有收到继续指示后才进入下一节。
