'use client';

import { cn } from '@/lib/utils';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
    label?: string;
    srOnly?: boolean;
    error?: FieldError;
    children: React.ReactNode;
    className?: string;
}

/**
 * DaisyUI 风格的表单字段封装，统一 label + error 展示逻辑。
 * 用法：
 * <FormField label="用户名" error={errors.username}>
 *   <input className="input w-full" {...register('username')} />
 * </FormField>
 */
export function FormField({ label, srOnly = false, error, children, className }: FormFieldProps) {
    return (
        <div className={cn('grid gap-1', className)}>
            {label && (
                <label className={srOnly ? 'sr-only' : 'label-text text-sm font-medium'}>
                    {label}
                </label>
            )}
            {children}
            {error?.message && <p className="px-1 text-xs text-red-600">{error.message}</p>}
        </div>
    );
}
