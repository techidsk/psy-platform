import * as z from 'zod';

const projectGroupFormSchema = z.object({
    group_name: z.string().min(2, '项目分组名称长度必须大于两位').max(50),
    description: z.string().optional(),
    gap: z.number().positive('间隔时间必须大于0').int('间隔时间必须为整数').optional(),
    id: z.number().optional(),
});

export { projectGroupFormSchema };
