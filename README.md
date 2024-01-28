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

## 业务方面

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
