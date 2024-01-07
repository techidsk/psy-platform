import * as z from 'zod';

const engineFormSchema = z.object({
    engine_name: z.string().min(2, '引擎名称长度必须大于两位').max(100),
    engine_description: z
        .string()
        .min(2, '引擎描述长度必须大于两位')
        .max(100)
        .optional()
        .or(z.literal('')),
    gpt_prompt: z.string().min(10, 'GPT提示词必须大于10个字'),
    temperature: z.number().min(0).max(1).optional().or(z.literal('')),
    max_tokens: z.number().min(100).max(2048).optional(),
    prompt: z.string().optional().or(z.literal('')),
    negative_prompt: z.string().optional().or(z.literal('')),
});

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

export { engineFormSchema, enginePatchFormSchema };
