# 第 01 节：初始化本地 Git 仓库

## 本节目标

1. 确认 Git、Node.js 和 npm 可用。
2. 在空目录中初始化以 `main` 为默认分支的本地 Git 仓库。
3. 配置第一版 `.gitignore`，避免后续误提交依赖、数据库和环境变量。
4. 理解工作区、暂存区和提交历史的关系。

本节不安装依赖，也不创建 NestJS 或 React 代码。项目说明和详细路线属于第 02 节。

## 环境检查命令

```powershell
git --version
node --version
npm --version
git config --global user.name
git config --global user.email
```

本机检查结果：

```text
git version 2.53.0.windows.2
Node.js v24.11.1
npm 11.6.2
Git 用户名：leledawang
Git 邮箱：2084355159@qq.com
```

这些命令只读取环境，不修改项目。

## 初始化命令

```powershell
git init -b main
```

- `git init`：在当前目录创建隐藏的 `.git` 元数据目录。
- `-b main`：将第一个分支直接命名为 `main`。
- `.git` 保存提交对象和分支引用，不要手动编辑其中的文件。

## 本节生成的文件

```text
library-management/
├─ .git/                  # Git 自动创建的仓库元数据
├─ docs/learning/
│  └─ 01-local-git.md     # 本节讲义
└─ .gitignore             # Git 忽略规则
```

`.gitignore` 忽略 `node_modules`、构建产物、SQLite 文件、本地环境变量、日志和编辑器临时文件。忽略规则只阻止未跟踪文件进入 Git，不会自动删除已经提交的文件。

## 本节调用链

```text
创建或修改文件
  -> git status 查看工作区变化
  -> git add 把指定变化放入暂存区
  -> git commit 保存一个学习快照
  -> git log 查看历史
```

## 验证方法

```powershell
git branch --show-current
git check-ignore -v example.sqlite
git status --short
```

预期当前分支为 `main`，`example.sqlite` 命中 `*.sqlite` 规则。提交前只暂存 `.gitignore` 和本节讲义；第 02 节文档暂时保持未跟踪。

## 本节提交命令

```powershell
git add .gitignore docs/learning/01-local-git.md
git commit -m "chore: initialize local Git repository"
```

提交后使用 `git show --stat --oneline HEAD` 验证提交范围。下一节将提交 `README.md`、`TODO.md` 和项目设计说明。
