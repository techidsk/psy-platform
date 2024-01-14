import * as z from 'zod';

/**
 *  用户注册验证表单
 */
export const registerSchema = z
    .object({
        username: z.string().min(2, '用户名长度必须大于两位').max(100),
        password: z.string().min(8, { message: '密码长度必须大于8位' }),
        qualtrics: z.string().optional(),
    })
    .refine((data): boolean => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+/.test(data.password), {
        message: '密码必须包含至少一个大写字母，一个小写字母和一个数字',
    });
// .superRefine(({ password }, checkPassComplexity) => {
//     const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
//     const containsLowercase = (ch: string) => /[a-z]/.test(ch);
//     let countOfUpperCase = 0,
//         countOfLowerCase = 0,
//         countOfNumbers = 0;
//     for (let i = 0; i < password.length; i++) {
//         let ch = password.charAt(i);
//         if (!isNaN(+ch)) countOfNumbers++;
//         else if (containsUppercase(ch)) countOfUpperCase++;
//         else if (containsLowercase(ch)) countOfLowerCase++;
//     }
//     if (countOfLowerCase < 1 || countOfUpperCase < 1 || countOfNumbers < 1) {
//         checkPassComplexity.addIssue({
//             code: 'custom',
//             message: '密码必须包含至少一个大写字母，一个小写字母和一个数字'
//         });
//         return false
//     }
//     return true
// });

/**
 * 登录用验证表达
 */
export const loginSchema = z.object({
    username: z.string().min(2, '用户名长度必须大于两位').max(100),
    password: z.string().min(8, { message: '密码长度必须大于8位' }),
});

export const userFormSchema = z
    .object({
        username: z.string().min(2, '用户名长度必须大于两位').max(100),
        password: z.string().min(8, { message: '密码长度必须大于8位' }),
        email: z
            .string()
            .email({ message: '请输入合法的电子邮件地址' })
            .optional()
            .or(z.literal('')),
        tel: z.string().optional(),
    })
    .superRefine(({ password }, checkPassComplexity) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0;
        for (let i = 0; i < password.length; i++) {
            let ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
        }
        if (countOfLowerCase < 1 || countOfUpperCase < 1 || countOfNumbers < 1) {
            checkPassComplexity.addIssue({
                code: 'custom',
                message: '密码必须包含至少一个大写字母，一个小写字母和一个数字',
            });
        }
    });

export const userPatchFormSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: '密码长度必须大于8位' })
            .optional()
            .or(z.literal('')),
        email: z
            .string()
            .email({ message: '请输入合法的电子邮件地址' })
            .optional()
            .or(z.literal('')),
        tel: z.string().optional(),
    })
    .superRefine(({ password }, checkPassComplexity) => {
        if (!password) return;

        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0;
        for (let i = 0; i < password.length; i++) {
            let ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
        }
        if (countOfLowerCase < 1 || countOfUpperCase < 1 || countOfNumbers < 1) {
            checkPassComplexity.addIssue({
                code: 'custom',
                message: '密码必须包含至少一个大写字母，一个小写字母和一个数字',
            });
        }
    });
