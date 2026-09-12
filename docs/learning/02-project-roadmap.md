# 第 02 节：创建项目说明和详细学习路线

## 本节目标

1. 理解 README、TODO 和设计文档各自解决什么问题。
2. 把最初的七阶段路线拆成可验证、可提交的细粒度节点。
3. 固定第一阶段技术选择，避免实现过程中随意改变范围。
4. 约定后续 Git 提交信息的中英文格式。

本节仍不安装依赖，也不创建业务代码。它解决的是“准备做什么、为什么这样做、怎样判断每一步完成”。

## 本节涉及的命令

查看当前未提交文件：

```powershell
git status --short
```

检查七个阶段和节点编号：

```powershell
rg -n "^## 阶段|^- \[.\] \*\*[0-9]{2}" TODO.md
```

检查设计中是否残留已经放弃的方案：

```powershell
rg -n "集中封装.*fetch|由 Vite 代理|配置 npm workspaces|第一阶段不把 ISBN|TBD|待定" README.md TODO.md docs/PROJECT_DESIGN.md
```

检查 Markdown 暂存内容是否存在尾随空格等问题：

```powershell
git diff --cached --check
```

## 本节生成或完善的文件

```text
library-management/
├─ README.md
├─ TODO.md
└─ docs/
   ├─ PROJECT_DESIGN.md
   └─ learning/
      └─ 02-project-roadmap.md
```

- `README.md`：项目首页。回答“这是什么、使用什么技术、从哪里开始”。
- `TODO.md`：学习导航。回答“当前做到哪里、下一步是什么、怎样验证和提交”。
- `PROJECT_DESIGN.md`：技术契约。回答“数据字段、API、前后端职责和错误行为是什么”。
- `02-project-roadmap.md`：本节课堂笔记，保存本节命令和思考过程。

## 文档调用链

本节没有运行时代码调用链，文档阅读链是：

```text
README 项目入口
  -> TODO 七阶段与当前节点
  -> PROJECT_DESIGN 技术细节
  -> docs/learning/NN 节点操作记录
  -> Git 提交保存学习快照
```

以后遇到“不知道项目做什么”时看 README；不知道下一步时看 TODO；不知道字段、接口或异常约定时看 PROJECT_DESIGN；想复习某一步命令时看对应 learning 文档。

## 已固定的第一阶段约定

- 后端：NestJS + TypeORM + SQLite。
- 前端：Vite + React + TypeScript + Axios + 原生 CSS。
- API 前缀：`/api`；后端端口 `3000`；前端端口 `5173`。
- 非空 ISBN 必须唯一，重复时返回 `409 Conflict`。
- 不引入登录、借阅、分页、Redux、React Router 或 UI 组件库。
- 每个节点单独提交，CRUD 的新增、查询、修改、删除分别实现。

## Git 提交信息约定

格式为：

```text
类型: 中文描述（English description）
```

例如：

```text
chore: 初始化 NestJS 后端（scaffold NestJS backend）
feat: 实现新增图书接口（create books）
fix: 处理 ISBN 重复（handle duplicate ISBN）
```

类型前缀便于分类；中文描述让当前学习者直接理解；英文括注帮助熟悉常见团队表达。

## 验证方法

本节完成时应满足：

1. `TODO.md` 恰好有七个阶段，节点从 01 连续到 49。
2. 每个节点都有目标、命令、文件、调用链、验证和提交六项说明。
3. 阶段一包含 Git、文档、NestJS、React 和忽略文件。
4. 文档统一使用 Axios 直连本地后端，不残留旧版 fetch、Vite 代理或 npm workspaces 方案。
5. 文档统一规定非空 ISBN 唯一并返回 `409`。
6. 第 01 节显示已完成，第 02 节在本次提交中标记完成。

## 本节提交命令

```powershell
git add README.md TODO.md docs/PROJECT_DESIGN.md docs/learning/02-project-roadmap.md
git commit -m "docs: 添加项目路线与设计（add project roadmap and design）"
```

下一节将首次访问网络并使用 Nest CLI 创建 `backend/`。执行前会先解释 CLI 命令的每个参数。
