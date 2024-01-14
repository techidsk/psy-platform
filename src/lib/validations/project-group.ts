import * as z from 'zod';

const projectGroupFormSchema = z.object({
    group_name: z.string().min(2, '项目分组名称长度必须大于两位').max(50),
    description: z.string().optional(),
});

export { projectGroupFormSchema };
