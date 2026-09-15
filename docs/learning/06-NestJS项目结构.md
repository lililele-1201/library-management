# 第 06 节：了解 NestJS 项目结构

## 本节目标

1. 区分 NestJS 的“应用启动链”和“HTTP 请求调用链”。
2. 理解 `main.ts`、Module、Controller、Service 的基本职责。
3. 理解装饰器和依赖注入在当前默认代码中的作用。
4. 实际启动 watch 模式并验证成功路由和不存在路由。
5. 学会从启动日志判断模块和路由是否注册成功。

本节不修改后端源码，不创建 Books 模块，也不接入数据库。

## 启动命令

在项目根目录执行：

```powershell
npm.cmd --prefix backend run start:dev
```

命令解析：

```text
npm.cmd
  -> --prefix backend：读取 backend/package.json
  -> run start:dev：找到 scripts.start:dev
  -> "nest start --watch"
  -> Nest CLI 编译并启动应用
```

如果已经进入 `backend/`，可以使用：

```powershell
cd backend
npm.cmd run start:dev
```

`npm.cmd start` 也能启动，但它执行的是 `nest start`，不带 `--watch`。开发阶段使用 `start:dev`，保存源码后会自动重新编译。

## 一、应用启动链

### 1. `package.json`

`backend/package.json` 保存命令入口：

```json
"start": "nest start",
"start:dev": "nest start --watch"
```

npm 不理解 NestJS 代码，它只负责找到并执行对应脚本。

### 2. `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
```

- `NestFactory.create(AppModule)`：创建 Nest 应用，并从根模块开始扫描依赖。
- `await`：等待异步创建和端口监听完成。
- `process.env.PORT ?? 3000`：有 `PORT` 环境变量时使用它，否则使用 3000。
- `bootstrap()`：名称可以改变，但通常表示“启动应用所需的初始化过程”。

`main.ts` 不是把请求直接导向 Service。它负责创建整个应用和启动 HTTP 服务。

### 为什么 TypeScript 文件导入 `.js`

项目的 `package.json` 包含：

```json
"type": "module"
```

`tsconfig.json` 使用 `nodenext`。TypeScript 源码虽然是 `app.module.ts`，但编译产物是 `app.module.js`；Node.js ESM 要求运行时导入路径带 `.js`，因此源码中写：

```typescript
import { AppModule } from './app.module.js';
```

TypeScript 编译器会把它解析到对应的 `.ts` 源文件，编译后路径仍能指向真实的 `.js` 文件。

### 3. `src/app.module.ts`

```typescript
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

`@Module()` 把普通类声明成 Nest 模块：

- `imports`：引入其他 Nest 模块。当前为空。
- `controllers`：注册接收 HTTP 请求的 Controller。
- `providers`：注册可由依赖注入容器创建的 Service 或其他 Provider。

AppModule 不负责调用业务方法，它告诉 Nest 容器“应用有哪些组成部分”。

### 启动日志

本节实际看到：

```text
AppModule dependencies initialized
AppController {/}
Mapped {/, GET} route
Nest application successfully started
```

对应关系：

```text
创建 AppModule
  -> 创建 AppService
  -> 创建 AppController 并注入 AppService
  -> 读取 @Controller 和 @Get 装饰器
  -> 注册 GET /
  -> 开始监听 3000
```

## 二、HTTP 请求调用链

### 1. `src/app.controller.ts`

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

- `@Controller()`：声明 Controller。括号中没有前缀，所以它位于根路径 `/`。
- 构造器参数：Nest 容器创建 Controller 时，把已注册的 AppService 实例传入。
- `private readonly`：把构造参数同时保存成只读成员 `this.appService`。
- `@Get()`：把下面的方法映射为 HTTP GET 请求。
- `getHello()`：Controller 方法主动调用 `this.appService.getHello()`。

### 2. `src/app.service.ts`

```typescript
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

- `@Injectable()`：告诉 Nest 这个类可以由依赖注入容器管理。
- `getHello()`：当前唯一的业务方法，返回字符串。

真正的请求调用链：

```text
GET http://localhost:3000/
  -> Express 接收 HTTP 请求
  -> Nest 路由匹配 @Controller() + @Get()
  -> AppController.getHello()
  -> this.appService.getHello()
  -> 返回 "Hello World!"
  -> Express 生成 HTTP 200 响应
```

Service 不会自动运行。必须由 Controller 或其他 Provider 显式调用它的方法。

## 三、实际请求验证

启动后执行：

```powershell
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing
$response.StatusCode
$response.Content
```

实际结果：

```text
200
Hello World!
```

访问尚未注册的路由：

```powershell
curl.exe -i http://127.0.0.1:3000/books
```

实际返回：

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

{"message":"Cannot GET /books","error":"Not Found","statusCode":404}
```

这证明 Nest 只响应 Controller 已注册的路径。响应头中的 `X-Powered-By: Express` 说明当前项目使用 `@nestjs/platform-express` 作为 HTTP 适配器。

## 四、Module、Controller、Service 的边界

可以先用一句话记忆：

```text
Module 负责组装，Controller 负责接请求，Service 负责业务逻辑。
```

- Module 不应该保存某次请求的数据。
- Controller 应保持轻量，主要做参数接收和 Service 调用。
- Service 不应依赖浏览器页面，它处理可复用的业务步骤。
- 数据库 Repository 后续会注入 Service，而不是直接放进 React 或 Controller。

未来图书请求会变成：

```text
POST /api/books
  -> BooksController.create(dto)
  -> BooksService.create(dto)
  -> Repository<Book>.save(book)
  -> SQLite
```

## 五、测试文件当前在测什么

- `app.controller.spec.ts`：创建 Controller 和 Service，直接调用 `getHello()`，属于较小范围的测试。
- `test/app.e2e-spec.ts`：创建完整 Nest 应用，通过 Supertest 发出 `GET /`，检查真实 HTTP 路由和响应。

本节使用真实运行中的应用额外验证了一次，与自动化测试结果一致。

## 本节生成或修改的文件

```text
README.md
TODO.md
docs/learning/06-NestJS项目结构.md
```

`backend/src/` 没有修改。本节的重点是先读懂官方生成代码，避免在不了解调用链时直接加入数据库和 CRUD。

## 本节验证标准

1. 能从 `package.json` 找到 `start:dev` 实际执行的命令。
2. 能解释 `main.ts` 为什么创建 AppModule 并监听 3000。
3. 能说出 Module、Controller、Service 各自职责。
4. 能解释 AppService 是由 Nest 注入，而不是 Controller 自己 `new` 出来的。
5. `GET /` 返回 200 和 `Hello World!`。
6. `GET /books` 因未注册而返回 404。
7. 验证结束后 3000 端口和 watch 进程已经停止。

## 本节提交命令

```powershell
git add README.md TODO.md docs/learning/06-NestJS项目结构.md
git commit -m "docs: 讲解 NestJS 项目结构（explain NestJS project structure）"
```

下一节将安装 `@nestjs/typeorm`、`typeorm` 和 `sqlite3`，先理解三个包的分工，还不会立即编写数据库连接配置。
