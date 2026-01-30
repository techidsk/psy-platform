# 说明

## 更新

1. `git pull` 拉取最新的版本
2. `pnpm install` 安装所需要的组件
3. `pnpm run build` 构建代码
4. `pnpm run start` 开启服务, 或者 `pm2 restart psy` 重启服务

## 部署

使用 [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) 进行部署

### 使用 ecosystem.config.js 部署

输入 `pm2 start ecosystem.config.js` 即可完成部署
输入 `pm2 logs psy` 查看部署状态

## 开发

### ORM

使用 [prisma](https://www.prisma.io/) 作为 ORM 工具进行管理。

prisma 国内难以下载的方案：
`export PRISMA_ENGINES_MIRROR=https://npmmirror.com/mirrors/prisma`

#### 使用

1. `npx prisma db pull` 拉取最新的数据库
2. `npx prisma generate` 生成全新的 prisma client
3. 重启服务验证是否更新成功

### formatter

#### VsCode

使用 EsLint 和 prettier 进行项目格式管理。
格式化方法使用 prettier
/home/ubuntu/.nvm/versions/node/v20.10.0/bin/npx

## 业务方面

### 用户实验方面

一个用户实验对应多个步骤
需要完成所有实验步骤后，才会完成 user_experiment 属性中的内容
但是如果一个实验对应多个写作实验，则需要对应子表

在 user_experiment 中更新 part，对应已经完成的 part 数字
默认是 1，对应第一步

### 添加新对外页面

### 发送生成接口的数据类型

```
{
    "user_prompts": [
        {
            "original": "我输入了一句话",
            "prompt": "a girl"
        },
        {
            "original": "我输入了一句话",
            "prompt": "a girl"
        },
        {
            "original": "我输入了一句话",
            "prompt": "a girl"
        }
    ],
    "engine_id": 2,
    "gpt": {
        "gpt_prompt": "请翻译成stalbel disdauij的华盛顿后端是的",
        "gpt_setting": {
            "temperature": 0.7,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "max_tokens": 64
        }
    },
    "workflow": {},
    "template": {
        "prompt": "Chromolithograph, {prompt} Asia,  Vibrant colors, intricate details, rich color saturation, multi-layered printing, ornate compositions.",
        "negative_prompt": "monochromatic, simple designs, limited color palette, imprecise registration, minimalistic, modern aesthetic, digital appearance"
    }
}

```
