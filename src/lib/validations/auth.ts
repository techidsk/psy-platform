import * as z from "zod"

export const userAuthSchema = z.object({
    username: z.string().min(1, "Username is required").max(100),
    password: z.string().min(6, { message: "Must be 6 or more characters long" })
})

export const exprimentSchema = z.object({
    name: z.string().min(1, "实验名称不能为空").max(100),
    description: z.string()
})

export const exprimentSettingSchema = z.object({
    display_num: z.number().min(1).max(4, '不能超过4张'),
})
