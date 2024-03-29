import * as z from 'zod';

const projectFormSchema = z.object({
    project_name: z.string().min(2, '项目名称长度必须大于两位').max(50),
    project_description: z.string().optional(),
    start_time: z.coerce.date().optional(),
    end_time: z.coerce.date().optional(),
    id: z.number().optional(),
    state: z.string().optional(), // 'AVAILABLE' | 'DRAFT' | 'ACHIVED';
});

export { projectFormSchema };
