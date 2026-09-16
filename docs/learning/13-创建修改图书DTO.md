# 第 13 节：创建修改图书 DTO

## 一、本节目标

这一节只完成一件事：定义“修改图书”时允许接收的数据及其校验规则。

完成后需要理解：

1. 新增图书与修改图书对必填字段的要求不同。
2. `PartialType()` 可以复用新增 DTO 的字段和校验规则。
3. 修改 DTO 中的字段可以省略，但传入时仍然必须合法。

本节不配置 `ValidationPipe`，也不实现修改接口；这些属于后面的学习节点。

## 二、为什么不能直接使用 CreateBookDto

新增图书时，必须提供完整的基础信息：

```json
{
  "title": "NestJS 入门",
  "author": "示例作者"
}
```

所以 `CreateBookDto` 中的 `title` 和 `author` 是必填字段。

修改图书时，通常只发送需要改变的字段。例如只修改书名：

```json
{
  "title": "NestJS 进阶"
}
```

如果直接使用 `CreateBookDto`，缺少 `author` 就会校验失败。因此需要一个字段全部可选的 `UpdateBookDto`。

## 三、安装 mapped-types

执行：

```powershell
npm.cmd --prefix backend install @nestjs/mapped-types
```

`@nestjs/mapped-types` 提供了根据现有 DTO 生成新 DTO 的工具。本节使用其中的 `PartialType()`。

## 四、核心代码

文件：`backend/src/books/dto/update-book.dto.ts`

```ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto.js';

export class UpdateBookDto extends PartialType(CreateBookDto) {}
```

代码含义：

```text
CreateBookDto
  -> 提供 title、author、isbn、publishedYear
  -> 提供原来的校验规则
  -> PartialType 将所有字段变成可选
  -> 生成 UpdateBookDto 的父类
  -> UpdateBookDto 继承这些字段与规则
```

## 五、逐行理解

### 1. 导入 PartialType

```ts
import { PartialType } from '@nestjs/mapped-types';
```

`PartialType` 的作用是：复制一个 DTO 的字段和验证装饰器，同时把每个字段变成可选字段。

### 2. 导入新增 DTO

```ts
import { CreateBookDto } from './create-book.dto.js';
```

修改 DTO 会复用新增 DTO 已经定义好的字段和校验规则，避免再写一遍。

### 3. 创建修改 DTO

```ts
export class UpdateBookDto extends PartialType(CreateBookDto) {}
```

可以把它简单理解成下面的效果：

```ts
class UpdateBookDto {
  title?: string;
  author?: string;
  isbn?: string | null;
  publishedYear?: number | null;
}
```

但它不只是添加了 `?`，还保留了 `@IsString()`、`@IsNotEmpty()`、`@MaxLength()`、`@IsInt()` 等运行时校验规则。

## 六、可选不代表随便填写

修改时可以只传一个字段：

```json
{
  "title": "NestJS 进阶"
}
```

也可以暂时不传任何字段：

```json
{}
```

但是只要传入字段，它仍然必须符合原来的规则：

```json
{
  "title": ""
}
```

这个数据仍然不合法，因为 `title` 保留了 `@IsNotEmpty()`。

再例如：

```json
{
  "publishedYear": "2026"
}
```

这也不合法，因为字符串 `"2026"` 不是整数，不能通过 `@IsInt()`。

## 七、为什么要复用，而不是重新写一份

如果手动复制所有字段和装饰器，新增 DTO 的规则发生变化时，很容易忘记同步修改 DTO。

使用 `PartialType(CreateBookDto)` 后：

```text
字段和校验规则只有一份来源：CreateBookDto
                 ↓
UpdateBookDto 自动复用，并把字段改成可选
```

这样能够减少重复代码，也能避免两个 DTO 的规则意外不一致。

## 八、DTO、Entity 和数据库的关系

本节的 `UpdateBookDto` 只负责描述和校验“客户端允许提交什么修改数据”。

```text
客户端 JSON
  -> UpdateBookDto 校验
  -> Controller（后续实现）
  -> Service（后续实现）
  -> Repository<Book>（后续实现）
  -> SQLite 的 book 表
```

`UpdateBookDto` 不是数据库表，也不会自己修改数据库。

## 九、测试内容

文件：`backend/src/books/dto/update-book.dto.spec.ts`

测试验证：

1. 空对象可以通过，因为所有字段都可省略。
2. 只提供一个合法字段可以通过。
3. 空书名、过长作者和过长 ISBN 仍然不能通过。
4. 越界年份、小数年份和字符串年份仍然不能通过。

运行聚焦测试：

```powershell
npm.cmd --prefix backend test -- update-book.dto.spec.ts
```

## 十、本节新增或修改的文件

```text
backend/package.json
backend/package-lock.json
  -> 添加 @nestjs/mapped-types

backend/src/books/dto/update-book.dto.ts
  -> 定义修改图书 DTO

backend/src/books/dto/update-book.dto.spec.ts
  -> 验证字段可省略，但传入时仍需合法

docs/learning/13-创建修改图书DTO.md
  -> 本节讲义

README.md
  -> 更新完成进度、下一节和最新讲义

TODO.md
  -> 勾选第 13 节
```

## 十一、完整验证

依次执行：

```powershell
npm.cmd --prefix backend test -- update-book.dto.spec.ts
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:e2e
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
```

本节没有增加 HTTP 接口，所以 e2e 测试只确认已有应用行为没有被破坏。

## 十二、常见误区

### 1. 认为 PartialType 会删除校验规则

它不会删除原规则。它只让字段可以省略；字段一旦出现，原来的校验规则仍会执行。

### 2. 手动复制 CreateBookDto

手动复制会造成重复代码。后续修改新增规则时，容易漏改更新规则。

### 3. 认为 UpdateBookDto 会自动修改数据库

DTO 只负责描述和校验输入。真正的修改操作要在后续的 Controller 和 Service 中实现。

### 4. 提前配置 ValidationPipe

本节直接使用 `class-validator` 测试 DTO。全局 `ValidationPipe` 属于第 14 节。

## 十三、本节验收标准

1. `@nestjs/mapped-types` 位于后端依赖中。
2. `UpdateBookDto` 通过 `PartialType(CreateBookDto)` 创建。
3. 修改数据可以省略任意字段。
4. 出现的字段仍遵守 `CreateBookDto` 的原校验规则。
5. DTO 聚焦测试和全部后端检查通过。
6. 没有修改 Controller、Service 或 Repository 行为。
7. 没有提前配置 `ValidationPipe` 或实现修改接口。

## 十四、本节提交命令

只暂存本节文件：

```powershell
git add README.md TODO.md backend/package.json backend/package-lock.json backend/src/books/dto/update-book.dto.ts backend/src/books/dto/update-book.dto.spec.ts docs/learning/13-创建修改图书DTO.md
```

检查并提交：

```powershell
git diff --cached --check
git diff --cached --name-only
git commit -m "feat: 定义修改图书 DTO（define update book DTO）"
git status --short
git show --stat --oneline HEAD
git push
```

下一节是第 14 节：配置请求参数验证。只有收到继续指示后才进入下一节。
