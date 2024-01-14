'use client';

import { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import store from 'store2';
import { exprimentSettingSchema } from '@/lib/validations/experiment';
import { Modal } from '../ui/modal';
import { useSettingState } from '@/state/_setting-atoms';

type FormData = z.infer<typeof exprimentSettingSchema>;

export function ExperimentSetting() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(exprimentSettingSchema),
    });
    const [displayNum, setDisplayNum] = useState(2);
    const [open, setOpen] = useState(false);

    const handleToggle = () => setOpen((prev) => !prev);
    const updateDisplayNum = useSettingState((state) => state.setDisplayNum);

    async function onSubmit(data: FormData) {
        store('display_num', data.display_num);
        updateDisplayNum(data.display_num);
        handleToggle();
    }

    useEffect(() => {
        setDisplayNum(store('display_num') || 2);
    }, []);

    return (
        <div>
            <button
                className="btn btn-outline rounded flex gap-2 items-center"
                onClick={handleToggle}
            >
                <Icons.settings className="mx-auto h-6 w-6" />
                设置
            </button>
            <Modal
                className="flex flex-col gap-4"
                open={open}
                onClose={handleToggle}
                disableClickOutside={!open}
            >
                <h3 className="font-bold text-lg">实验内设置</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <div className="grid gap-1">
                            <label className="sr-only" htmlFor="display-num">
                                图片显示数量
                            </label>
                            <input
                                nano_id="display-num"
                                placeholder="请输入图片显示数量"
                                defaultValue={displayNum}
                                type="number"
                                min="1"
                                max="4"
                                step="1"
                                autoCapitalize="none"
                                autoComplete="display-num"
                                autoCorrect="off"
                                className="input input-bordered w-full"
                                {...register('display_num', { valueAsNumber: true })}
                            />
                            {errors?.display_num && (
                                <p className="px-1 text-xs text-red-600">
                                    {errors.display_num.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-row-reverse gap-2">
                            <button className="btn btn-ghost" type="submit">
                                保存
                            </button>
                            <button className="btn btn-error text-white">重置</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
