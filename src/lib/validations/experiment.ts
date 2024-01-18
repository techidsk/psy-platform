import * as z from 'zod';

export const exprimentSchema = z.object({
    experiment_name: z.string().min(1, '实验名称不能为空').max(100),
    description: z.string(),
    engine_id: z.number().optional(),
});

export const exprimentSettingSchema = z.object({
    display_num: z.number().min(1).max(4, '不能超过4张'),
});
