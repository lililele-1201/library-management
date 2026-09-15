# 第 10 节：定义图书数据模型

## 本节目标

这一节只做一件事：使用 TypeORM Entity 描述图书数据，并让 SQLite 生成对应的 `book` 表。

学完后需要能够回答：

1. Entity、TypeScript 类、数据库表和一行数据之间是什么关系。
2. `@Entity`、`@Column`、`@PrimaryGeneratedColumn`、`@CreateDateColumn` 和 `@UpdateDateColumn` 分别做什么。
3. 图书的七个字段如何映射到 SQLite。
4. 为什么根数据库配置需要先加入 `entities: [Book]`。
5. 为什么本节还不使用 `forFeature([Book])` 和 Repository。

本节不会注入 Repository、编写 Service 业务方法、创建 DTO、配置 ValidationPipe 或实现 CRUD。

## 一、前置知识

第 08 节已经建立 SQLite 数据源，第 09 节已经创建图书模块骨架：

```text
AppModule
├─ TypeOrmModule：连接 backend/data/library.sqlite
└─ BooksModule
   ├─ BooksController
   └─ BooksService
```

但数据库还不知道图书长什么样。现在需要使用 Entity 提供映射说明。

## 二、Entity 是什么

Entity 可以理解为“数据库表的 TypeScript 设计图”。

```text
Book 类            <-> book 表
Book 类的属性       <-> book 表的列
一个 Book 对象      <-> book 表的一行记录
```

Entity 类本身不是某一本书，也不会自动执行新增或查询。它只告诉 TypeORM：对象属性应该如何保存到数据库。

## 三、开始前检查

在项目根目录执行：

```powershell
git status --short
git branch --show-current
git remote -v
```

本节开始时工作区干净，本地 `main` 与 `origin/main` 都位于：

```text
f863de5 feat: 创建图书模块（create Books module）
```

## 四、创建 Book Entity

新增文件：

```text
backend/src/books/book.entity.ts
```

完整代码：

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('book')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 100 })
  author: string;

  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  isbn: string | null;

  @Column({ type: 'integer', nullable: true })
  publishedYear: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

装饰器紧挨着类或属性，为 TypeORM 保存映射元数据。TypeScript 类型负责代码层面的检查，装饰器选项负责数据库层面的映射，两者不是同一件事。

## 五、逐个理解字段

### 1. `@Entity('book')`

```typescript
@Entity('book')
export class Book {}
```

它告诉 TypeORM：`Book` 是一个 Entity，对应的数据库表名明确写为 `book`。

### 2. 自增主键 `id`

```typescript
@PrimaryGeneratedColumn()
id: number;
```

- `Primary`：这是主键，用来唯一标识一行记录。
- `Generated`：值由数据库生成。
- SQLite 中会成为自增整数主键。

新增图书时不需要由前端提供 `id`。

### 3. 必填文本 `title` 和 `author`

```typescript
@Column({ length: 200 })
title: string;

@Column({ length: 100 })
author: string;
```

没有写 `nullable: true`，所以数据库列默认不允许 `NULL`。

`length` 会进入 TypeORM 元数据和表结构描述。但 SQLite 对 `varchar(200)` 的长度不像某些数据库那样严格执行，因此“书名最多 200 个字符”和“作者最多 100 个字符”还需要在第 12 节通过 DTO 校验真正拦截请求。

### 4. 可选且唯一的 `isbn`

```typescript
@Column({ type: 'varchar', length: 20, nullable: true, unique: true })
isbn: string | null;
```

- `type: 'varchar'`：保存文本。
- `length: 20`：声明最大设计长度。
- `nullable: true`：允许不填写，此时保存为 `NULL`。
- `unique: true`：非空 ISBN 不能重复。

SQLite 的唯一约束允许多行都为 `NULL`，符合“不填写 ISBN 的图书可以有多本”的设计。空字符串不是 `NULL`，后续输入处理需要把“不填写”和“空字符串”区分清楚。

本节只建立数据库约束；把重复 ISBN 错误转换为 HTTP `409` 属于第 21 节。

### 5. 可选整数 `publishedYear`

```typescript
@Column({ type: 'integer', nullable: true })
publishedYear: number | null;
```

它允许保存整数年份或 `NULL`。设计中的 0～9999 范围会在 DTO 节点进行请求校验，本节不提前实现。

### 6. 创建和更新时间

```typescript
@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
```

- `CreateDateColumn`：第一次保存记录时自动填写创建时间。
- `UpdateDateColumn`：记录更新时自动刷新修改时间。

Entity 中使用 `Date`，因为后端内部处理的是日期对象；将来通过 HTTP 返回 JSON 时，日期会序列化为字符串，所以项目对外接口类型会使用 `string`。

## 六、让 DataSource 认识 Book

只创建 Entity 文件还不够。TypeORM 不会扫描任意文件，DataSource 必须知道需要加载哪些 Entity。

在 `backend/src/app.module.ts` 中导入：

```typescript
import { Book } from './books/book.entity.js';
```

然后在根连接配置中加入：

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'data/library.sqlite',
  entities: [Book],
  autoLoadEntities: true,
  synchronize: true,
})
```

这四项的关系是：

```text
entities: [Book]
  -> 当前明确告诉 DataSource 加载 Book Entity

autoLoadEntities: true
  -> 以后也可自动收集功能模块通过 forFeature 注册的 Entity

synchronize: true
  -> 根据已加载 Entity 同步本地教学数据库表结构
```

为什么本节不用 `TypeOrmModule.forFeature([Book])`？

```text
entities: [Book]
  -> 让整个 DataSource 认识 Book，并能够创建 book 表

forFeature([Book])
  -> 在 BooksModule 中注册 Repository<Book> Provider
```

第 10 节只定义数据模型和表；第 11 节再专门学习 Repository 注册与注入。

## 七、实体测试

新增：

```text
backend/src/books/book.entity.spec.ts
```

测试创建独立的内存 SQLite 数据库：

```typescript
dataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  entities: [Book],
  synchronize: true,
});

await dataSource.initialize();
```

`:memory:` 表示数据库只存在于测试进程的内存中：

- 不修改开发用的 `library.sqlite`。
- 每次测试从空数据库开始。
- `destroy()` 后自动消失。

第一个测试执行：

```sql
PRAGMA table_info("book")
```

`PRAGMA` 是 SQLite 查询自身结构信息的命令。测试确认实际表包含：

```text
id
title
author
isbn
publishedYear
createdAt
updatedAt
```

第二个测试读取 TypeORM 元数据，确认主键自增、长度、可空、ISBN 唯一以及自动时间列规则。

运行聚焦测试：

```powershell
npm.cmd --prefix backend test -- book.entity.spec.ts
```

其中第二个 `--` 后的内容会传给 Vitest，只运行匹配的实体测试文件。

## 八、完整调用链

应用启动时：

```text
main.ts
  -> NestFactory.create(AppModule)
  -> TypeOrmModule.forRoot(...)
  -> 创建并初始化 DataSource
  -> DataSource 读取 entities: [Book]
  -> @Entity 和各列装饰器提供元数据
  -> synchronize: true 比较实体与数据库结构
  -> sqlite3 在 library.sqlite 中创建或更新 book 表
  -> Nest 继续启动并监听 3000 端口
```

当前没有 Repository 和业务操作，因此调用链到表结构同步为止。

## 九、本节新增或修改的文件

```text
backend/src/books/book.entity.ts
  -> 定义 Book Entity 和七个字段

backend/src/books/book.entity.spec.ts
  -> 使用内存 SQLite 验证实体和表结构

backend/src/app.module.ts
  -> 把 Book 加入 DataSource 的 entities

docs/learning/10-define-book-entity.md
  -> 本节讲义

README.md
  -> 更新完成进度、下一节和最新讲义

TODO.md
  -> 勾选第 10 节
```

`backend/data/library.sqlite` 会发生本地运行时变化，但仍被 Git 忽略，不能提交。

## 十、自动验证

依次执行：

```powershell
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:e2e
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
```

验证目的：

- 全部单元测试包含新的 Entity 测试。
- e2e 导入真实 `AppModule`，能够初始化包含 Book 的数据源。
- Lint 检查新 TypeScript 文件。
- build 检查装饰器、类型和 ESM 导入。

## 十一、手动验证

启动后端：

```powershell
npm.cmd --prefix backend run start:dev
```

应用应无 TypeORM 错误并成功启动。然后在另一个 PowerShell 中查询真实数据库表结构：

```powershell
node -e "const sqlite3 = require('./backend/node_modules/sqlite3'); const db = new sqlite3.Database('./backend/data/library.sqlite'); db.all('PRAGMA table_info(book)', (error, rows) => { if (error) throw error; console.table(rows); db.close(); });"
```

命令各部分含义：

- `require(...)`：加载项目已经安装的 sqlite3 驱动。
- `new sqlite3.Database(...)`：打开实际的开发数据库文件。
- `PRAGMA table_info(book)`：读取 `book` 表的列信息。
- `console.table(rows)`：在终端中显示查询结果。
- `db.close()`：查询完成后关闭数据库。

输出应包含七个字段。再确认原接口：

```powershell
$response = Invoke-WebRequest http://localhost:3000/
$response.StatusCode
$response.Content
```

预期为 `200` 和 `Hello World!`。验证后按 `Ctrl+C` 停止开发服务器。

## 十二、常见错误

### 1. 只创建 Entity 文件，没有加入 DataSource

TypeORM 不会因为文件名以 `.entity.ts` 结尾就自动加载它。当前必须加入 `entities: [Book]`，否则启动时不会创建 `book` 表。

### 2. 把 Entity 当成一条数据

`Book` 类描述的是整张表的结构；以后通过 `new Book()` 或 Repository 创建的对象才对应一行数据。

### 3. 认为 `length: 200` 已完成所有输入验证

SQLite 不严格执行 varchar 长度。外部请求仍需要 DTO 和 ValidationPipe 校验，这些属于后续节点。

### 4. 时间字段写成 `string`

Entity 内部使用 `Date`；HTTP JSON 中才表现为字符串。数据库类型、后端运行时类型和前端接口类型不必完全相同。

### 5. 提前注入 Repository

本节没有修改 `BooksService`，也没有调用 `forFeature([Book])`。这两项属于第 11 节。

### 6. 提交 SQLite 文件

数据库文件是本地运行数据。使用下面的命令确认它继续被忽略：

```powershell
git check-ignore -v backend/data/library.sqlite
```

## 十三、本节验收标准

1. `Book` 映射到 `book` 表。
2. 表包含七个计划字段。
3. `id` 是自增主键。
4. `title` 和 `author` 不允许 `NULL`。
5. `isbn` 可空、长度元数据为 20，并具有唯一约束。
6. `publishedYear` 可空且映射为整数。
7. 创建和更新时间使用专用装饰器。
8. 实体测试、全部后端检查和真实数据库结构验证通过。
9. 没有 Repository 注入、DTO 或 CRUD。
10. Git 提交不包含 SQLite 文件或构建产物。

## 十四、本节提交命令

只暂存本节文件：

```powershell
git add README.md TODO.md backend/src/app.module.ts backend/src/books/book.entity.ts backend/src/books/book.entity.spec.ts docs/learning/10-define-book-entity.md
```

检查暂存内容：

```powershell
git diff --cached --check
git diff --cached --name-only
```

提交并推送：

```powershell
git commit -m "feat: 定义图书实体（define Book entity）"
git status --short
git show --stat --oneline HEAD
git push
```

下一节是第 11 节：将 Book Repository 注入 Service。只有收到继续指示后才进入下一节。
