# 本地数据库目录

NestJS 后端启动时，TypeORM 会在这个目录中创建并连接 `library.sqlite`。

`library.sqlite` 保存本机运行数据，内容会随着学习和测试发生变化，因此根目录 `.gitignore` 使用 `*.sqlite` 规则忽略它。这个说明文件会提交到 Git，用来在全新克隆项目后保留 `data/` 目录。

请不要手动把 SQLite 主文件或它的 `-journal`、`-shm`、`-wal` 临时文件加入 Git。
