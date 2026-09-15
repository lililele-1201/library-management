# 第 07 节：安装 TypeORM 和 SQLite 基础依赖

## 本节目标

这一节只做一件事：为 NestJS 后端安装访问 SQLite 数据库所需的三个运行时依赖。

学完后需要能够回答：

1. `@nestjs/typeorm`、`typeorm` 和 `sqlite3` 分别负责什么。
2. 为什么三个包缺一不可。
3. 为什么它们安装在 `dependencies`，而不是 `devDependencies`。
4. `package.json` 和 `package-lock.json` 分别记录什么。
5. 为什么“安装成功”并不代表“数据库已经连接”。

本节不会修改 `app.module.ts`，不会生成 SQLite 文件，也不会创建图书模块、图书表或 CRUD 接口。这样可以先学清依赖的职责，再在第 08 节单独学习数据库连接。

## 一、安装前的状态

安装前，后端已经可以处理默认的 `GET /` 请求，但它还没有数据库能力：

```text
浏览器或测试
  -> NestJS Controller
  -> NestJS Service
  -> 返回内存中的字符串 "Hello World!"
```

此时 `backend/package.json` 的 `dependencies` 中只有 NestJS HTTP 应用的基础依赖，没有 TypeORM 和 SQLite 驱动。

先检查工作区：

```powershell
git status --short
```

没有输出表示开始本节前工作区是干净的，不会把上一节遗留的修改混入本次提交。

## 二、安装命令

在项目根目录执行：

```powershell
npm.cmd --prefix backend install @nestjs/typeorm typeorm sqlite3
```

这条命令可以分成四部分理解：

```text
npm.cmd
  -> 在 Windows 中运行 npm 的命令文件
  -> --prefix backend：把 backend 当作 npm 项目目录
  -> install：安装依赖并更新依赖清单
  -> @nestjs/typeorm typeorm sqlite3：本次安装的三个包
```

如果终端已经进入 `backend/`，等价命令是：

```powershell
cd backend
npm.cmd install @nestjs/typeorm typeorm sqlite3
```

不要写成下面这样：

```powershell
npm start:dev
```

`start:dev` 是 `package.json` 中自定义的脚本名，需要通过 `run` 执行：

```powershell
npm.cmd run start:dev
```

不过本节只是安装依赖，不需要启动开发服务器。

## 三、三个依赖分别做什么

### 1. `@nestjs/typeorm`

这是 NestJS 与 TypeORM 之间的集成包，也可以理解为“适配层”。

它提供后续要使用的：

- `TypeOrmModule.forRoot(...)`：向整个 Nest 应用注册数据库连接。
- `TypeOrmModule.forFeature(...)`：向某个功能模块注册实体对应的 Repository。
- `@InjectRepository(...)`：让 Nest 的依赖注入容器把 Repository 传给 Service。

它擅长的是“把 TypeORM 放进 NestJS 的模块和依赖注入体系”，它本身不是数据库，也不负责真正读写 SQLite 文件。

### 2. `typeorm`

这是 ORM 的核心库。ORM 是“对象关系映射”的简称。

将来代码中的图书对象可能是：

```typescript
const book = {
  id: 1,
  title: 'NestJS 入门',
  author: '示例作者',
};
```

SQLite 中的数据则按表、行和列保存。TypeORM 负责在两者之间转换：

```text
TypeScript 的 Book 对象
  <-> TypeORM Entity 和 Repository
  <-> SQLite 的 book 表记录
```

后续会用到的 `Entity`、`Column`、`Repository`、`find`、`save`、`remove` 等能力都来自 TypeORM。

### 3. `sqlite3`

这是 Node.js 与 SQLite 通信的数据库驱动。

TypeORM 知道“要执行什么数据库操作”，但需要具体驱动把操作发送给具体数据库。我们选择 SQLite，所以安装 `sqlite3`。

可以把三者类比成：

```text
@nestjs/typeorm：让数据库工具接入 NestJS 的插座
typeorm：负责组织和翻译数据操作
sqlite3：真正与 SQLite 数据库文件通信
```

## 四、依赖调用链

三个包未来的完整位置是：

```text
BooksService
  -> NestJS 依赖注入容器
  -> @nestjs/typeorm 提供 Repository
  -> TypeORM 把对象操作转换成 SQL 操作
  -> sqlite3 驱动执行操作
  -> SQLite 数据库文件
```

但现在这个调用链还没有真正开始工作，因为我们只完成了安装，还没有在 `AppModule` 中调用 `TypeOrmModule.forRoot(...)`。

也就是说：

```text
已安装 = 项目拥有这些工具
已配置 = 应用知道数据库类型、文件位置等连接信息
已使用 = Service 通过 Repository 真正读写数据
```

本节只完成第一层，第 08 节完成第二层，后面的图书模块与 CRUD 节点再完成第三层。

## 五、安装修改了哪些文件

### `backend/package.json`

新增了三个直接运行时依赖：

```json
"@nestjs/typeorm": "^12.0.1",
"sqlite3": "^6.0.1",
"typeorm": "^1.1.1"
```

版本前的 `^` 表示 npm 在以后重新解析依赖时，可以在兼容的版本范围内选择版本，并不等于永远固定为当前这一版。

### `backend/package-lock.json`

锁文件记录本次实际解析出的精确依赖关系，包括三个直接依赖及其间接依赖。团队成员或持续集成环境使用锁文件，可以更稳定地安装相同的依赖树。

初学阶段可以先这样区分：

```text
package.json      -> 项目主动声明“我需要哪些包”
package-lock.json -> npm 记录“这次具体安装了哪些版本和依赖关系”
```

两个文件都应该提交到 Git。

### `backend/node_modules/`

npm 会把下载的包放入这里，但它体积大、能够根据两个依赖文件重新生成，并且已经被 `.gitignore` 忽略，所以不能提交到 Git。

### 为什么放在 `dependencies`

这三个包在后端应用启动和访问数据库时仍然需要，不只是在开发或测试时使用，因此属于运行时依赖：

```text
dependencies    -> 应用运行时需要
devDependencies -> 主要在开发、检查、测试或构建时使用
```

安装命令没有添加 `--save-dev`，所以 npm 自动把它们写入 `dependencies`。

## 六、核对已安装版本

执行：

```powershell
npm.cmd --prefix backend list --depth=0 @nestjs/typeorm typeorm sqlite3
```

本节实际结果：

```text
@nestjs/typeorm@12.0.1
sqlite3@6.0.1
typeorm@1.1.1
```

`--depth=0` 表示只查看后端项目直接安装的顶层依赖，避免输出整个庞大的间接依赖树。

## 七、理解安装警告

安装时出现了 `EBADENGINE` 警告。当前环境是 Node.js `24.11.1`，而 Nest CLI 的间接依赖 `@angular-devkit/*` 声明 Node.js 24 系列需从 `24.15.0` 开始支持。

需要区分警告和失败：

```text
npm warn + 退出码 0 -> 安装完成，但存在需要留意的兼容性提示
npm error 或非 0 退出码 -> 安装失败，需要先排错
```

本次命令退出码为 0，依赖安装成功，后续四项检查也全部通过。为了避免未来升级依赖时遇到兼容问题，可以把 Node.js 更新到该工具声明支持的版本；但这一警告没有阻止当前节点完成。

还出现了 `prebuild-install` 已停止维护的提示，这是 `sqlite3` 依赖树中的间接包提示，不是我们在业务代码中直接使用的包，也没有导致安装失败。此处先记录，不在本教学节点中扩大依赖改造范围。

## 八、验证方法

### 1. 检查依赖树

```powershell
npm.cmd --prefix backend list --depth=0 @nestjs/typeorm typeorm sqlite3
```

三个包都显示版本号且命令退出码为 0，说明 npm 能够解析它们。

### 2. 运行后端单元测试

```powershell
npm.cmd --prefix backend test
```

结果：1 个测试文件通过，1 个测试通过。

### 3. 运行端到端测试

```powershell
npm.cmd --prefix backend run test:e2e
```

结果：1 个测试文件通过，1 个测试通过。

### 4. 运行代码检查

```powershell
npm.cmd --prefix backend run lint
```

结果：退出码为 0，没有 Oxlint 错误。

### 5. 构建后端

```powershell
npm.cmd --prefix backend run build
```

结果：退出码为 0，NestJS 后端构建成功。

这些检查证明“安装新依赖没有破坏已有应用”，但不能证明“数据库连接成功”。数据库文件和连接将在下一节验证。

## 九、本节生成或修改的文件

```text
README.md
TODO.md
backend/package.json
backend/package-lock.json
docs/learning/07-TypeORM与SQLite依赖.md
```

`backend/node_modules/` 有本地变化，但被 Git 忽略，不属于提交内容。构建生成的 `backend/dist/` 同样被忽略。

## 十、本节验收标准

1. 能说明三个依赖各自的职责。
2. 能说明为什么它们位于 `dependencies`。
3. 能通过 `npm list` 查看三个包的版本。
4. 能说明 `package.json` 与 `package-lock.json` 的区别。
5. 能说明本节尚未连接数据库，也不会生成 SQLite 文件。
6. 后端单元测试、端到端测试、代码检查和构建全部通过。
7. Git 提交中不包含 `node_modules`、`dist` 或 SQLite 文件。

## 十一、本节提交命令

```powershell
git add README.md TODO.md backend/package.json backend/package-lock.json docs/learning/07-TypeORM与SQLite依赖.md
git diff --cached --check
git commit -m "chore: 安装 TypeORM 和 SQLite（install TypeORM and SQLite）"
```

这里使用 `chore`，是因为本节改变的是项目依赖和工程配置，还没有新增用户可以调用的图书功能。

下一节会在 `AppModule` 中加入 `TypeOrmModule.forRoot(...)`，配置 SQLite 数据库文件位置，并通过启动日志和文件生成情况验证连接。
