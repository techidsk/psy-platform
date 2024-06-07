import * as z from 'zod';

export const exprimentSchema = z.object({
    experiment_name: z.string().min(1, '实验名称不能为空').max(100),
    description: z.string().optional().or(z.literal('')),
    intro: z.string().optional().or(z.literal('')),
});

export const exprimentSettingSchema = z.object({
    display_num: z.number().min(1).max(4, '不能超过4张'),
});

export const exprimentStepSchema = z.object({
    step_name: z.string().min(1, '步骤名称不能为空').max(100),
    title: z.string().optional(),
    step_content: z.string().optional(),
    type: z.number().optional(),
    step_image: z.any().optional(),
    redirect_url: z
        .string()
        .url('请输入合法的URL地址，必须以http开头')
        .or(z.literal(''))
        .nullable()
        .optional(),
    countdown: z.number().max(120, '写作时间不得超过120分钟').optional(),
    pic_mode: z.boolean().optional(),
    history_mode: z.boolean().optional(),
});
