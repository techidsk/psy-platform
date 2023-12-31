import * as z from 'zod';

/**
 *  用户注册验证表单
 */
export const registerSchema = z.object({
    username: z.string().min(2, '用户名长度必须大于两位').max(100),
    password: z.string().min(6, { message: '密码长度必须大于6位' }),
    qualtrics: z.string().optional(),
});

/**
 * 登录用验证表达
 */
export const loginSchema = z.object({
    username: z.string().min(2, '用户名长度必须大于两位').max(100),
    password: z.string().min(6, { message: '密码长度必须大于6位' }),
});

export const exprimentSchema = z.object({
    name: z.string().min(1, '实验名称不能为空').max(100),
    description: z.string(),
});

export const exprimentSettingSchema = z.object({
    display_num: z.number().min(1).max(4, '不能超过4张'),
});

export const userFormSchema = z.object({
    username: z.string().min(2, '用户名长度必须大于两位').max(100),
    password: z.string().min(6, { message: '密码长度必须大于6位' }),
    email: z.string().email({ message: '请输入合法的电子邮件地址' }).optional().or(z.literal('')),
    tel: z.string().optional(),
});
