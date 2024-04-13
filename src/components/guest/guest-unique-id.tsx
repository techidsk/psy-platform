'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import store from 'store2';

export default function GuestUniqueKey({
    userUniqueKey,
    inviteCode,
}: {
    userUniqueKey: string;
    inviteCode: string;
}) {
    const [userKey, setUserKey] = useState<string | null>();
    const GUEST_UNIQUE_KEY = 'userUniqueKey';

    const router = useRouter();

    useEffect(() => {
        // 尝试从 localStorage 获取用户ID
        const itemStr = store.get(GUEST_UNIQUE_KEY);
        if (itemStr) {
            const item = JSON.parse(itemStr);
            const now = new Date();
            // 检查存储的用户ID是否过期
            if (now.getTime() > item.expiry) {
                // 已过期，设置新的用户ID并更新localStorage
                setAndStoreKey(userUniqueKey);
            } else {
                // 未过期，使用localStorage中的用户ID
                setUserKey(item.value);
            }
        } else {
            // localStorage中没有用户ID，设置新的用户ID
            setAndStoreKey(userUniqueKey);
        }
    }, []);

    // 设置用户ID到状态和localStorage
    const setAndStoreKey = (key: string) => {
        const now = new Date();
        const item = {
            value: key,
            expiry: now.getTime() + 86400000, // 设置24小时后过期
        };
        store.set(GUEST_UNIQUE_KEY, JSON.stringify(item));
        setUserKey(key);
    };

    const combineKey = `${userUniqueKey}${inviteCode}`;

    return (
        <div className="flex flex-col space-y-4 text-center">
            <h1 className="text-4xl font-semibold tracking-tight">欢迎参加本次实验</h1>
            {userKey && (
                <>
                    <div className="text text-slate-500 dark:text-slate-400">
                        这是您本次实验的唯一ID{'  '}
                        <kbd className="kbd kbd-md">{userKey}</kbd>
                        请牢记在心
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => router.push(`/guest/dashboard/${combineKey}`)}
                    >
                        开始
                    </button>
                </>
            )}
        </div>
    );
}
