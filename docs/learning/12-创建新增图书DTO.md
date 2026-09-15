# 第 12 节：创建新增图书 DTO

## 本节目标

这一节只完成一件事：定义新增图书请求允许接收的字段和校验规则。

学完后需要能够回答：

1. DTO 是什么，它与 Entity 有什么区别。
2. 为什么 TypeScript 类型不能代替运行时校验。
3. `class-transformer` 和 `class-validator` 分别负责什么。
4. 每个验证装饰器有什么作用。
5. 为什么现在还不能通过 HTTP 请求看到验证错误。

本节不会创建修改 DTO、配置全局 `ValidationPipe`、实现 POST 接口或调用 Repository。

## 一、DTO 是什么

DTO 是 Data Transfer Object（数据传输对象）的缩写。它用来描述数据在系统边界之间传递时应该是什么形状。

本节的 `CreateBookDto` 描述前端新增图书时允许提交的数据：

```text
title          必填
author         必填
isbn           可选
publishedYear  可选
```

DTO 和 Entity 的职责不同：

```text
CreateBookDto
  -> 描述外部请求可以传什么
  -> 负责输入校验

Book Entity
  -> 描述数据如何保存在 book 表
  -> 包含数据库生成的 id、createdAt、updatedAt
```

所以新增 DTO 不包含 `id`、`createdAt` 和 `updatedAt`，这些字段不能由前端随意指定。

## 二、为什么需要运行时校验

只写 TypeScript 类型：

```typescript
title: string;
```

只能在编译代码时帮助开发者。HTTP 请求中的 JSON 来自程序外部，TypeScript 类型在运行时已经被删除，用户仍然可能传入：

```json
{
  "title": 123,
  "publishedYear": "不是数字"
}
```

因此还需要验证装饰器在程序运行时检查真实值。

## 三、安装依赖

在项目根目录执行：

```powershell
npm.cmd --prefix backend install class-validator class-transformer
```

命令含义：

- `npm.cmd`：Windows 中执行 npm。
- `--prefix backend`：修改后端项目的依赖。
- `install`：安装依赖并更新 `package.json`、`package-lock.json`。
- `class-validator`：提供字符串、长度、整数、范围等验证装饰器。
- `class-transformer`：把普通 JavaScript 对象转换成 DTO 类实例。

本节实际安装版本：

```text
class-transformer@0.5.1
class-validator@0.15.1
```

这两个包在应用运行时仍然需要，所以放在 `dependencies`，不是 `devDependencies`。

安装时仍会看到已经记录过的 Node.js 版本警告：当前 Node.js 是 24.11.1，Nest CLI 的部分间接依赖声明 24 系列需要 24.15.0 或更高版本。安装退出码为 0，本节测试和构建均能正常执行，因此不在当前节点扩大升级范围。

## 四、创建 DTO

新增文件：

```text
backend/src/books/dto/create-book.dto.ts
```

代码：

```typescript
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  isbn?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(9999)
  publishedYear?: number | null;
}
```

## 五、逐个理解验证规则

### `@IsString()`

要求运行时值必须是字符串，数字、对象和数组都不能冒充书名、作者或 ISBN。

### `@IsNotEmpty()`

要求值不能是空字符串。`title` 和 `author` 必须填写；ISBN 可以省略或传 `null`，但如果传字符串就不能是 `''`。

### `@MaxLength(数量)`

限制字符串的最大长度：

```text
title   -> 200
author  -> 100
isbn    -> 20
```

Entity 中的长度描述数据库结构，DTO 中的长度装饰器才负责拒绝过长的请求输入。

### `@IsOptional()`

当值是 `undefined` 或 `null` 时，跳过后续验证器。因此可选字段可以不传，也可以明确传 `null`。

如果传入其他值，后面的装饰器仍然会执行。

### `@IsInt()`

要求 `publishedYear` 是整数。`2026` 合法，`2026.5` 和字符串 `'2026'` 不合法。

### `@Min(0)` 和 `@Max(9999)`

要求出版年份位于 0～9999 之间，包含两个边界。

## 六、`?`、`null` 和 `@IsOptional()`

下面的声明：

```typescript
isbn?: string | null;
```

可以拆开理解：

```text
?             -> 属性可以不存在，也就是 undefined
string | null -> 属性存在时可以是字符串或 null
```

TypeScript 声明负责开发阶段的类型检查，`@IsOptional()` 负责运行时跳过缺失值，两者需要配合。

## 七、创建 DTO 测试

新增：

```text
backend/src/books/dto/create-book.dto.spec.ts
```

测试辅助函数：

```typescript
async function getInvalidProperties(input: Record<string, unknown>) {
  const dto = plainToInstance(CreateBookDto, input);
  const errors = await validate(dto);

  return errors.map((error) => error.property);
}
```

调用链：

```text
普通 JavaScript 对象
  -> plainToInstance(CreateBookDto, input)
  -> CreateBookDto 实例
  -> validate(dto)
  -> class-validator 读取装饰器规则
  -> 返回 ValidationError 数组
```

测试覆盖：

- 完整合法数据。
- 省略可选字段。
- 可选字段传 `null`。
- 缺少 `title` 和 `author`。
- 必填字段或 ISBN 为空字符串。
- title、author、ISBN 超长。
- 年份小于 0、大于 9999、不是整数或使用字符串。

运行聚焦测试：

```powershell
npm.cmd --prefix backend test -- create-book.dto.spec.ts
```

本节结果为一个测试文件、10 个测试通过。

## 八、为什么需要 `plainToInstance()`

HTTP JSON 解析后只是普通对象：

```typescript
const input = {
  title: 'NestJS 入门',
  author: '示例作者',
};
```

它不是通过 `new CreateBookDto()` 创建的实例。`plainToInstance()` 把它转换成 DTO 实例，让后续流程明确按照 `CreateBookDto` 的装饰器规则处理。

这里只负责转换，不代表数据一定合法；真正检查规则的是 `validate()`。

## 九、当前调用链与未来调用链

本节测试中的调用链：

```text
测试输入对象
  -> class-transformer
  -> CreateBookDto 实例
  -> class-validator
  -> 验证结果
```

第 14 节配置 `ValidationPipe` 后，真实请求才会自动经过：

```text
HTTP JSON 请求体
  -> ValidationPipe
  -> class-transformer
  -> CreateBookDto
  -> class-validator
  -> 合法时进入 Controller
  -> 非法时返回 400
```

所以现在新增 DTO 文件不会自动改变任何 HTTP 接口行为。

## 十、本节新增或修改的文件

```text
backend/package.json
backend/package-lock.json
  -> 添加 class-validator 和 class-transformer

backend/src/books/dto/create-book.dto.ts
  -> 定义新增图书字段和验证规则

backend/src/books/dto/create-book.dto.spec.ts
  -> 验证合法与非法输入

docs/learning/12-创建新增图书DTO.md
  -> 本节讲义

README.md
  -> 更新完成进度、下一节和最新讲义

TODO.md
  -> 勾选第 12 节
```

## 十一、自动验证

依次执行：

```powershell
npm.cmd --prefix backend test -- create-book.dto.spec.ts
npm.cmd --prefix backend test
npm.cmd --prefix backend run test:e2e
npm.cmd --prefix backend run lint
npm.cmd --prefix backend run build
```

本节还没有 HTTP 验证行为，因此 e2e 只确认新依赖和 DTO 没有破坏应用启动及原有接口。

## 十二、手动验证

启动后端：

```powershell
npm.cmd --prefix backend run start:dev
```

另开 PowerShell 验证原接口：

```powershell
$response = Invoke-WebRequest http://localhost:3000/
$response.StatusCode
$response.Content
```

预期仍然是 `200` 和 `Hello World!`。

当前没有 POST 图书接口，也没有全局 `ValidationPipe`，所以不能通过发送 HTTP 请求验证 DTO。这是本节边界，不是功能错误。完成后按 `Ctrl+C` 停止服务器。

## 十三、常见错误

### 1. 只写 TypeScript 类型

`title: string` 在运行时不能阻止客户端发送数字，必须配合 `class-validator` 装饰器。

### 2. 把 DTO 当成 Entity

DTO 验证外部输入，Entity 描述数据库表。不要在新增 DTO 中加入由数据库生成的 `id` 和时间字段。

### 3. 可选字段漏写 `@IsOptional()`

只写 TypeScript 的 `?` 不会让 class-validator 在运行时自动跳过缺失字段。

### 4. 以为数字字符串会自动变成数字

本节没有启用隐式类型转换，字符串 `'2026'` 不能通过 `@IsInt()`。JSON 应发送数字 `2026`。

### 5. 现在就期待 HTTP 返回 400

DTO 只是定义规则。第 14 节把它接入全局 `ValidationPipe` 后，Nest 才会自动验证请求。

### 6. 提前实现 POST 接口

新增图书接口属于第 15 节，本节不修改 Controller、Service 或 Repository 调用。

## 十四、本节验收标准

1. 两个验证依赖位于后端 `dependencies`。
2. `CreateBookDto` 只包含四个可输入字段。
3. title 和 author 必填、非空且长度正确。
4. ISBN 可省略或为 null，填写时非空且最长 20。
5. publishedYear 可省略或为 null，填写时为 0～9999 的整数。
6. DTO 聚焦测试和全部后端检查通过。
7. 没有修改 Controller、Service 或 Repository 行为。
8. 没有提前配置 ValidationPipe 或实现 CRUD。

## 十五、本节提交命令

只暂存本节文件：

```powershell
git add README.md TODO.md backend/package.json backend/package-lock.json backend/src/books/dto docs/learning/12-创建新增图书DTO.md
```

检查并提交：

```powershell
git diff --cached --check
git diff --cached --name-only
git commit -m "feat: 定义新增图书 DTO（define create book DTO）"
git status --short
git show --stat --oneline HEAD
git push
```

下一节是第 13 节：创建修改图书 DTO。只有收到继续指示后才进入下一节。
