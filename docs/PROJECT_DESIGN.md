# 第一阶段项目设计

## 1. 学习目标

完成第一阶段后，学习者应能解释一次浏览器点击如何经过 React、HTTP、NestJS、TypeORM，最终读写 SQLite，并能使用测试和 Git 检查每一步是否正确。

## 2. 目录设计

```text
library-management/
├─ backend/              # NestJS 服务
├─ frontend/             # Vite + React 应用
├─ docs/
│  ├─ learning/          # 每个节点的独立讲义
│  └─ PROJECT_DESIGN.md  # 第一阶段设计约定
├─ .gitignore
├─ README.md
└─ TODO.md
```

`backend` 和 `frontend` 各自维护 `package.json` 和依赖。初学阶段使用 `npm --prefix backend ...` 与 `npm --prefix frontend ...` 从根目录运行命令，先学清两个应用的边界，不引入 npm workspaces。

## 3. 图书数据模型

| 字段 | TypeScript 类型 | 数据库含义 | 规则 |
| --- | --- | --- | --- |
| `id` | `number` | 自增主键 | 由数据库生成 |
| `title` | `string` | 书名 | 必填，1～200 个字符 |
| `author` | `string` | 作者 | 必填，1～100 个字符 |
| `isbn` | `string \| null` | ISBN | 可选，最多 20 个字符；填写后必须唯一 |
| `publishedYear` | `number \| null` | 出版年份 | 可选，0～9999 的整数 |
| `createdAt` | `string` | 创建时间 | 由后端生成 |
| `updatedAt` | `string` | 最后修改时间 | 由后端生成 |

ISBN 为空时允许多本图书不填写；填写 ISBN 后必须唯一。重复 ISBN 由后端转换为 `409 Conflict`，不把数据库错误直接暴露给前端。

## 4. HTTP API

后端监听 `http://localhost:3000`，统一使用 `/api` 前缀。

| 操作 | 方法与路径 | 成功状态 | 主要错误 |
| --- | --- | --- | --- |
| 新增 | `POST /api/books` | `201` | `400` 输入不合法；`409` ISBN 重复 |
| 查询列表 | `GET /api/books` | `200` | 无数据时返回 `[]` |
| 查询详情 | `GET /api/books/:id` | `200` | `404` 图书不存在 |
| 修改 | `PATCH /api/books/:id` | `200` | `400`、`404` 或 `409` |
| 删除 | `DELETE /api/books/:id` | `204` | `404` 图书不存在 |

## 5. 后端职责边界

- `Controller`：接收 HTTP 请求、读取参数和请求体、调用 Service、返回 HTTP 结果。
- `DTO`：描述并校验外部输入，阻止错误数据进入业务逻辑。
- `Service`：表达新增、查询、修改、删除的业务步骤。
- `Entity`：描述 TypeScript 对象与 SQLite 表之间的映射。
- `Repository`：由 TypeORM 提供，负责真正的数据库读写。

后端调用链：

```text
HTTP 请求
  -> ValidationPipe
  -> BooksController
  -> BooksService
  -> Repository<Book>
  -> SQLite
```

## 6. 前端职责边界

- `App`：组合页面状态和主要区域。
- `BookList`：展示列表并发出编辑、删除意图。
- `BookForm`：收集新增或修改数据。
- `api/books.ts`：集中封装 Axios，组件不拼接 URL。
- `types/book.ts`：保存前后端契约对应的 TypeScript 类型。

前端开发服务器监听 `http://localhost:5173`。Axios 从 `VITE_API_BASE_URL` 读取 `http://localhost:3000/api` 并直接请求 NestJS；后端显式允许本地前端 Origin，以便完整观察浏览器跨域流程。

## 7. 状态与错误处理

前端只使用 React 自带的 `useState` 和 `useEffect`。页面明确展示加载中、空列表、请求失败和提交中状态。删除前需要用户确认；失败后保留表单内容，方便修改后重试。

## 8. 测试策略

- 生成脚手架和纯配置节点：通过启动、构建、Lint 或配置检查验证。
- 后端 CRUD：先写会失败的测试，确认失败原因，再写最小实现使其通过。
- 前端 API 层使用 Axios；CRUD 组件先写用户行为测试，再实现组件和 API 调用。
- 联调节点：同时启动前后端，用真实 SQLite 完成新增、查询、修改、删除。

## 9. 教学环境约定

- 使用当前环境中的 Node.js 24 和 npm 11。
- 使用 npm，不混用 pnpm 或 yarn。
- TypeORM `synchronize: true` 只用于本地教学阶段；生产项目应使用迁移。
- SQLite 文件、依赖目录、构建产物和本地环境变量不进入 Git。
- 每个学习节点只提交与该节点有关的改动。
