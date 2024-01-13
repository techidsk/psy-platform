# 说明

## 开发

### ORM

使用 [prisma](https://www.prisma.io/) 作为 ORM 工具进行管理。

#### 使用

1. `npx prisma db pull` 拉取最新的数据库
2. `npx prisma generate` 生成全新的 prisma client
3. 重启服务验证是否更新成功

### formatter

#### VsCode

使用 EsLint 和 prettier 进行项目格式管理。
格式化方法使用 prettier
/home/ubuntu/.nvm/versions/node/v20.10.0/bin/npx
