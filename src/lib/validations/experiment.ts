import * as z from 'zod';

export const exprimentSchema = z.object({
    experiment_name: z.string().min(1, '实验名称不能为空').max(100),
    description: z.string().optional().or(z.literal('')),
    intro: z.string().optional().or(z.literal('')),
    engine_id: z.number().optional(),
    countdown: z.number().min(5).max(60).optional(),
    pic_mode: z.boolean().optional(),
});

export const exprimentSettingSchema = z.object({
    display_num: z.number().min(1).max(4, '不能超过4张'),
});

export const exprimentStepSchema = z.object({
    step_name: z.string().min(1, '步骤名称不能为空').max(100),
    title: z.string().min(1, '标题不能为空').max(100),
    step_content: z.string().min(1, '步骤内容不能为空'),
    type: z.number().optional(),
    step_image: z.any().optional(),
    pre: z.boolean().optional(),
});
