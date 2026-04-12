import * as z from 'zod';

const enginePatchFormSchema = z.object({
    engine_name: z.string().min(2, '引擎名称长度必须大于两位').max(100),
    engine_description: z
        .string()
        .min(2, '引擎描述长度必须大于两位')
        .max(100)
        .optional()
        .or(z.literal('')),
    gpt_prompt: z.string().min(10, 'GPT提示词必须大于10个字'),
});

export { enginePatchFormSchema };
