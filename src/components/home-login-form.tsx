'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import store from 'store2';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { loginSchema } from '@/lib/validations/auth';
const crypto = require('crypto');

type FormData = z.infer<typeof loginSchema>;

export function HomeLoginForm() {
    const {
        register,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [savePass, setSavePass] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setSavePass(store('savePass') || false);
        setValue('username', decode('username') || '');
        setValue('password', decode('password') || '');
    }, [setValue]);

    async function onSubmit(data: FormData) {
        if (savePass) {
            const key = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);
            store('key', key.toString('hex'));
            store('iv', iv.toString('hex'));
            if (data.username) {
                store('username', encode(data.username, key, iv));
                store('password', encode(data.password, key, iv));
            }
            store('savePass', true);
        }

        setIsLoading(true);
        const signInResult = await signIn('credentials', {
            username: data.username,
            password: data.password,
            redirect: false,
            callbackUrl: searchParams?.get('from') || '/dashboard',
        });
        setIsLoading(false);

        if (!signInResult?.ok) {
            return toast({
                title: '登陆失败',
                description: '用户名或者密码错误',
                variant: 'destructive',
                duration: 5000,
            });
        }

        toast({
            title: '已成功登录',
            description: '登陆成功将会跳转至控制台',
            duration: 3000,
        });

        const callbackUrl = searchParams?.get('from') || '/dashboard';
        router.push(callbackUrl);
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 用户名 */}
            <div className="space-y-2">
                <label className="label">用户名</label>
                <input
                    type="text"
                    placeholder="请输入用户名"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    {...register('username')}
                />
                {errors?.username && (
                    <p className="text-xs text-red-500">{errors.username.message}</p>
                )}
            </div>

            {/* 密码 */}
            <div className="space-y-2">
                <label className="label">密码</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="请输入密码"
                        autoCapitalize="none"
                        autoComplete="current-password"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="w-full h-12 px-4 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                        {...register('password')}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                </div>
                {errors?.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
            </div>

            {/* 记住密码 & 忘记密码 */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={savePass}
                        onChange={() => setSavePass(!savePass)}
                        className="checkbox"
                    />
                    <span className="text-sm text-gray-600">记住密码</span>
                </label>
            </div>

            {/* 登录按钮 */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? '登录中...' : '登录'}
            </button>
        </form>
    );
}

function encode(str: string, key: string, iv: string) {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
    } catch (err: any) {
        return err.message || err;
    }
}

function decode(name: string) {
    let str = store(name) || '';
    if (!str) {
        return '';
    }
    let key = Buffer.from(store('key'), 'hex');
    let iv = Buffer.from(store('iv'), 'hex');

    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
    } catch (err: any) {
        return err.message || err;
    }
}
