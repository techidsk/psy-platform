import * as z from 'zod';

export const userPrivacySchema = z.object({
    gender: z.string().refine((val) => val !== '' && val !== undefined && val !== null, {
        message: '请选择性别',
    }),
    ages: z.string().refine((val) => val !== '' && val !== undefined && val !== null, {
        message: '请选择年龄',
    }),
    qualtrics: z.string().optional().or(z.literal('')),
});
