# 图书管理教学项目

这是一个面向 NestJS 初学者的全栈教学项目。第一阶段只实现图书的新增、查询、修改、删除，以及 React 前端与 NestJS 后端的联调。

## 技术栈

- 后端：NestJS、TypeORM、SQLite
- 前端：Vite、React、TypeScript、Axios、原生 CSS
- 测试：Vitest（后端）、Vitest + React Testing Library（前端）
- 版本管理：本地 Git 仓库

## 学习方式

项目被拆成细粒度学习节点。每个节点都会：

1. 说明目标和前置知识。
2. 解释需要执行的命令。
3. 列出新增或修改的文件。
4. 解释代码调用链。
5. 给出自动化测试和手动验证方法。
6. 更新 [`TODO.md`](TODO.md)。
7. 单独创建一次 Git 提交。

第 01 至 06 节已经完成并提交。下一步是第 07 节：安装和配置 TypeORM 基础依赖。后续严格按照 `TODO.md` 的七个阶段和节点编号学习。

## 第一阶段范围

包含：图书 CRUD、输入校验、错误响应、SQLite 持久化、React 单页界面、前后端联调。

暂不包含：用户登录、权限、借阅、分页、搜索、封面上传、Redux、React Router、UI 组件库和线上部署。

## 预期调用链

```text
浏览器操作
  -> React 组件
  -> 前端 API 函数
  -> HTTP /api/books
  -> NestJS Controller
  -> NestJS Service
  -> TypeORM Repository
  -> SQLite
```

详细架构约定见 [`docs/PROJECT_DESIGN.md`](docs/PROJECT_DESIGN.md)，本节讲义见 [`docs/learning/01-local-git.md`](docs/learning/01-local-git.md)。
