# 第 08 节：连接 SQLite 数据库

## 本节目标

这一节只完成一件事：让 NestJS 在启动时通过 TypeORM 建立 SQLite 数据库连接。

学完后需要能够回答：

1. 为什么数据库连接配置放在 `AppModule` 的 `imports` 中。
2. `TypeOrmModule.forRoot(...)`、`type`、`database`、`autoLoadEntities` 和 `synchronize` 分别表示什么。
3. 为什么当前还没有 Entity，也能验证数据库连接。
4. SQLite 为什么不需要单独启动数据库服务器。
5. 为什么本地数据库文件不应该提交到 Git。

本节不会创建 `BooksModule`、`BooksController`、`BooksService`、Book Entity、Repository、DTO 或任何 CRUD 接口。这些内容属于后续学习节点。

## 一、前置知识

第 07 节已经安装了三个运行时依赖：

```text
@nestjs/typeorm -> 把 TypeORM 接入 NestJS 的模块和依赖注入系统
typeorm         -> 管理数据库连接以及之后的 Entity 和 Repository
sqlite3         -> 真正读写 SQLite 数据库文件的驱动
```

“安装依赖”和“建立连接”是两个不同阶段：

```text
安装依赖
  -> package.json 声明项目拥有数据库工具
  -> node_modules 保存工具代码

建立连接
  -> AppModule 提供连接参数
  -> TypeORM 根据参数初始化数据源
  -> sqlite3 打开或创建数据库文件
```

第 07 节只完成了第一部分，本节完成第二部分。

还需要记住 `AppModule` 是根模块。NestJS 从它开始发现应用需要的 Controller、Service 和其他模块。

### TypeORM 版本兼容修正

第 07 节安装依赖时，npm 解析到了当时最新的 `typeorm@1.1.1`。但 TypeORM 1.x 已经移除了旧的 `sqlite3` 驱动，只支持用 `better-sqlite3` 连接本地 SQLite。第一次使用 `type: 'sqlite'` 验证时，因此同时出现了编译错误和运行时错误：

```text
Type '"sqlite"' is not assignable ...
MissingDriverError: Wrong driver: "sqlite" given.
```

这不是路径写错，而是依赖组合不兼容。项目已经明确选择 `sqlite3`，本节不擅自更换驱动，所以把 TypeORM 调整到仍支持该驱动的最新 0.3.x 版本：

```powershell
npm.cmd --prefix backend install typeorm@0.3.31
```

这条命令的含义是：

```text
npm.cmd
  -> 在 Windows 中运行 npm
  -> --prefix backend：修改 backend 项目的依赖
  -> install：安装并更新 package.json 与 package-lock.json
  -> typeorm@0.3.31：使用仍支持 sqlite3 的 TypeORM 兼容版本
```

`@nestjs/typeorm@12.0.1` 声明兼容 `typeorm ^0.3.0`，因此这个组合满足 Nest 集成包的版本范围。安装后执行：

```powershell
npm.cmd --prefix backend list --depth=0 @nestjs/typeorm typeorm sqlite3
```

本节使用的直接依赖版本是：

```text
@nestjs/typeorm@12.0.1
typeorm@0.3.31
sqlite3@6.0.1
```

这里不是更换技术栈：数据库仍然是 SQLite，Node.js 驱动仍然是 `sqlite3`，只是让 ORM 版本与已选驱动重新兼容。

## 二、开始前检查

在项目根目录执行：

```powershell
git status --short
git branch --show-current
git remote -v
```

各命令的含义是：

- `git status --short`：用紧凑格式显示工作区修改；没有输出表示工作区干净。
- `git branch --show-current`：显示当前分支，本项目应为 `main`。
- `git remote -v`：显示远程仓库的读取和推送地址。

本节开始时，本地 `main` 与 `origin/main` 都位于提交 `2a25ee4`，工作区没有未提交文件。

## 三、确认数据库位置

第 05 节已经用下面的路径演示 SQLite 忽略规则：

```text
backend/data/library.sqlite
```

因此本节沿用已有约定，不另造文件名。目录和文件的职责是：

```text
backend/
├─ data/
│  ├─ README.md       -> 提交到 Git，用于保留和解释目录
│  └─ library.sqlite  -> 启动时生成，被 Git 忽略
└─ src/
   └─ app.module.ts   -> 保存数据库连接配置
```

SQLite 不是需要长期单独运行的数据库服务器。它把数据保存在普通文件中，应用通过 `sqlite3` 驱动直接打开这个文件。因此本地开发时不需要另外启动 MySQL、PostgreSQL 那样的数据库服务。

## 四、配置根模块

修改 `backend/src/app.module.ts`，先导入 NestJS 的 TypeORM 集成模块：

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
```

这里导入的不是 TypeORM 核心包中的普通函数，而是 `@nestjs/typeorm` 提供的 Nest 模块。它负责把数据库数据源放进 NestJS 的模块系统和依赖注入容器。

然后把数据库配置放入根模块的 `imports`：

```typescript
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/library.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 1. 为什么放在 `imports`

`imports` 表示当前模块依赖哪些其他 Nest 模块。数据库连接是一项供应用使用的基础能力，因此 `AppModule` 要导入配置好的 TypeORM 模块。

它不能放进 `controllers`，因为它不负责接收 HTTP 请求；也不能放进 `providers`，因为这里导入的是一个已经配置完成的 Nest 动态模块，不是我们自己声明的 Service。

### 2. `forRoot` 表示什么

`forRoot` 可以理解为“为应用的根范围提供一次基础配置”。它接收数据库类型、文件路径等选项，并返回一个配置好的 Nest 动态模块。

名字中的 `Root` 不表示磁盘根目录，也不表示 URL 根路径；它强调的是这份连接配置服务于整个 Nest 应用。后续功能模块要使用某个 Entity 的 Repository 时，会学习用途不同的 `forFeature(...)`。

### 3. 为什么返回结果能放进 `imports`

普通的 Nest 模块通常直接写成 `SomeModule`。动态模块则通过方法根据配置在运行时生成模块定义。`TypeOrmModule.forRoot(...)` 的返回值符合 Nest 的 `DynamicModule` 结构，所以和普通模块一样能够放进 `imports`。

可以把这个过程理解为：

```text
连接选项
  -> TypeOrmModule.forRoot(...)
  -> 配置好的动态模块
  -> AppModule.imports
  -> Nest 初始化该模块
```

### 4. `type: 'sqlite'`

`type` 告诉 TypeORM 使用哪一种数据库。写成 `'sqlite'` 后，TypeORM 会选择 SQLite 的连接方式，并使用已经安装的 `sqlite3` 驱动。

如果这里误写成其他数据库类型，TypeORM 会期待不同的驱动和连接参数，无法按当前项目方式打开 SQLite 文件。

### 5. `database: 'data/library.sqlite'`

对 SQLite 来说，`database` 表示数据库文件路径。文件不存在时，驱动会在连接过程中创建它；文件已经存在时，则会重新打开同一个文件，所以数据可以跨应用重启保留。

这里使用相对路径。通过下面的项目根目录命令启动时：

```powershell
npm.cmd --prefix backend run start:dev
```

npm 会把脚本的工作目录设为 `backend/`，所以路径的解析过程是：

```text
工作目录 backend/
  + data/library.sqlite
  = backend/data/library.sqlite
```

相对路径取决于进程的当前工作目录，不是相对于 `app.module.ts` 文件，也不是相对于仓库根目录。应使用项目约定的 npm 命令启动，避免从不同工作目录直接执行编译产物而得到意外位置。

### 6. `autoLoadEntities: true`

Entity 用来描述 TypeScript 类和数据库表之间的映射。本节还没有 Entity，但先打开 `autoLoadEntities`，让以后通过 `TypeOrmModule.forFeature(...)` 注册到功能模块的 Entity 自动加入这个数据源配置。

它不会扫描并凭空创建 Entity，也不会在本节创建图书表。当前没有任何功能模块调用 `forFeature(...)`，所以自动加载列表仍然为空。

### 7. `synchronize: true`

`synchronize` 表示连接建立后，让 TypeORM 根据已注册 Entity 的元数据自动同步数据库表结构。

当前没有 Entity，因此没有表结构需要同步；这个选项仍可保留，为之后的本地教学节点自动创建图书表做准备。

教学开发阶段暂时使用它，是因为每新增或调整一个 Entity，就能立即在本地 SQLite 中观察表结构变化，减少初学阶段同时学习迁移工具的负担。

但生产环境通常不能随意使用 `synchronize: true`：

- 自动修改表结构的过程缺少可审查、可重复执行的版本记录。
- 某些字段修改可能导致数据丢失或产生不符合预期的结构变化。
- 多个环境或多个应用实例很难保证以受控顺序完成变更。

生产项目通常使用 Migration（数据库迁移）：把每次表结构变化写成明确脚本，经过审查、备份和测试后再执行。

## 五、应用启动时发生什么

加入配置后，启动调用链变为：

```text
backend/src/main.ts
  -> NestFactory.create(AppModule)
  -> Nest 读取 AppModule 的 imports
  -> 执行 TypeOrmModule.forRoot(...) 生成的动态模块初始化逻辑
  -> TypeORM 根据 type 和 database 创建数据源
  -> sqlite3 驱动打开 backend/data/library.sqlite
  -> 文件不存在时创建文件
  -> synchronize 检查已注册 Entity（当前为空）
  -> 数据库数据源初始化完成
  -> Nest 继续创建 AppController 和 AppService
  -> app.listen(...) 监听 3000 端口
```

依赖初始化是 `NestFactory.create(AppModule)` 的一部分。数据库连接失败时，这一步不能正常完成，应用也不会继续稳定监听端口。因此“应用正常启动并能响应请求”与“数据库文件确实生成”结合起来，可以验证本节连接配置已经生效。

现在没有 Entity，只表示数据库中还没有由 TypeORM 管理的业务表，不表示不能连接。连接数据源和定义表结构是两件事：

```text
连接数据源 -> 能打开 SQLite 文件
注册 Entity -> 知道要管理哪些表和字段
使用 Repository -> 真正增删改查表中记录
```

本节只验证第一层。

## 六、本节新增或修改的文件

```text
backend/src/app.module.ts
  -> 导入 TypeOrmModule，并配置 SQLite 数据源

backend/package.json
backend/package-lock.json
  -> 将 TypeORM 调整到支持 sqlite3 的 0.3.x 兼容版本

backend/data/README.md
  -> 保留 data 目录，说明数据库文件的用途和 Git 规则

docs/learning/08-连接SQLite数据库.md
  -> 保存本节完整讲义

README.md
  -> 更新完成进度、下一节和本地数据库说明

TODO.md
  -> 勾选第 08 节
```

运行时还会生成：

```text
backend/data/library.sqlite
```

这个文件被 Git 忽略，不属于提交内容。

## 七、自动验证

### 1. 单元测试

```powershell
npm.cmd --prefix backend test
```

它验证原有 `AppController` 与 `AppService` 行为没有被数据库配置破坏。

在运行测试前，也可以再次核对三个数据库依赖：

```powershell
npm.cmd --prefix backend list --depth=0 @nestjs/typeorm typeorm sqlite3
```

### 2. 端到端测试

```powershell
npm.cmd --prefix backend run test:e2e
```

端到端测试会导入真实 `AppModule`。测试模块初始化时也会初始化 TypeORM 数据源，然后请求 `GET /`，因此它同时覆盖应用模块装配、数据库连接和默认接口。

### 3. 代码检查

```powershell
npm.cmd --prefix backend run lint
```

它检查后端 TypeScript 源码和测试是否符合当前 Oxlint 规则。

### 4. 构建

```powershell
npm.cmd --prefix backend run build
```

它验证新增的导入和 TypeORM 配置能够通过 TypeScript 编译。生成的 `backend/dist/` 已被 Git 忽略。

## 八、手动验证

### 1. 启动开发服务器

在项目根目录执行：

```powershell
npm.cmd --prefix backend run start:dev
```

看到 Nest 应用成功启动且没有 TypeORM 或 SQLite 错误后，不要关闭这个终端。

### 2. 请求原有接口

打开另一个 PowerShell，执行：

```powershell
$response = Invoke-WebRequest http://localhost:3000/
$response.StatusCode
$response.Content
```

预期结果是：

```text
200
Hello World!
```

这说明接入数据库没有破坏原有 Controller 和 Service 调用链。

### 3. 检查数据库文件

仍在项目根目录执行：

```powershell
Get-Item backend/data/library.sqlite
```

命令能显示文件信息，说明 SQLite 文件已经创建。

### 4. 检查 Git 忽略规则

```powershell
git check-ignore -v backend/data/library.sqlite
```

预期能看到根目录 `.gitignore` 中的 `*.sqlite` 规则。还可以执行：

```powershell
git status --short
```

状态列表不应包含 `library.sqlite`。

### 5. 停止服务器

回到运行开发服务器的终端，按 `Ctrl+C`。验证结束后必须停止进程，避免遗留的服务继续占用 3000 端口。

## 九、为什么数据库文件不提交

`library.sqlite` 是运行数据，不是源代码：

- 每位开发者本地录入的数据可能不同，提交后容易产生无意义的二进制冲突。
- 测试和手动操作会不断改变文件，导致工作区频繁出现与代码无关的修改。
- 数据库可能包含不应进入仓库的个人信息或测试数据。
- Git 不适合审查 SQLite 二进制文件内部每一条数据变化。

应该提交的是 Entity、Migration、种子脚本或文档等“如何得到数据库结构和初始数据”的可读代码。本项目当前还没有这些内容；实际数据库文件始终只留在本机。

根 `.gitignore` 已包含：

```gitignore
*.sqlite
*.sqlite-journal
*.sqlite-shm
*.sqlite-wal
```

除了主文件，这些规则也忽略 SQLite 在不同日志模式下可能生成的临时文件。

## 十、常见错误

### 1. `MissingDriverError: Wrong driver: "sqlite" given`

TypeORM 1.x 已移除 `sqlite3` 驱动。如果项目仍使用 `sqlite3`，应核对 `typeorm` 是否保持在支持它的 0.3.x 版本。本节已经调整为 `typeorm@0.3.31`，不要为了消除错误而同时安装两套 SQLite 驱动。

### 2. `SQLITE_CANTOPEN: unable to open database file`

常见原因是 `data/` 目录不存在，或者进程没有写入权限。本项目提交 `backend/data/README.md` 来保留目录；确认从项目根目录使用约定的 npm 命令启动。

### 3. 数据库文件出现在错误目录

原因通常是从不同工作目录直接启动程序。`database` 的相对路径以进程工作目录为基准，不以源码文件位置为基准。

### 4. `DriverPackageNotInstalledError: SQLite package has not been found installed`

说明 `sqlite3` 没有正确安装。可以执行：

```powershell
npm.cmd --prefix backend list sqlite3
```

本节不替换数据库驱动，也不改变既定技术栈。

### 5. 误以为没有数据表就是连接失败

本节没有 Entity，所以数据库文件可以是空数据库。文件成功生成、应用无连接错误并能正常响应，已经证明连接链路成立。图书表会在第 10 节定义 Entity 后出现。

### 6. 把 `start:dev` 当成 npm 命令

`start:dev` 是 `package.json` 中的脚本名，必须通过 `run` 调用：

```powershell
npm.cmd --prefix backend run start:dev
```

不能写成 `npm start:dev`。

### 7. 将 `synchronize: true` 直接用于生产环境

本项目只在本地教学阶段使用自动同步。生产数据库应采用经过审查和测试的 Migration，并在变更前做好备份。

## 十一、本节验收标准

1. TypeORM 已调整到与 `sqlite3` 兼容的 0.3.x 版本。
2. `AppModule` 已导入并配置 `TypeOrmModule.forRoot(...)`。
3. 后端能启动，没有 TypeORM 或 SQLite 连接错误。
4. `GET http://localhost:3000/` 返回状态码 `200` 和 `Hello World!`。
5. `backend/data/library.sqlite` 已生成。
6. `git check-ignore -v` 能证明数据库文件被忽略。
7. 单元测试、端到端测试、代码检查和构建全部通过。
8. 没有创建 Books 模块、Entity、Repository、DTO 或 CRUD。
9. Git 提交只包含第 08 节预期文件，不包含数据库、依赖目录或构建产物。

## 十二、本节提交命令

先只暂存本节文件：

```powershell
git add README.md TODO.md backend/package.json backend/package-lock.json backend/src/app.module.ts backend/data/README.md docs/learning/08-连接SQLite数据库.md
```

检查暂存内容：

```powershell
git diff --cached --check
git diff --cached --name-only
```

确认文件列表中没有 `node_modules`、`dist`、`library.sqlite` 或无关修改后提交：

```powershell
git commit -m "feat: 连接 SQLite 数据库（connect SQLite database）"
```

提交后检查并推送：

```powershell
git status --short
git show --stat --oneline HEAD
git push
```

下一节是第 09 节：创建图书模块。只有收到继续指示后才进入下一节。
