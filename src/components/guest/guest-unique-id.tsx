'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import store from 'store2';

export default function GuestUniqueKey({
    userUniqueKey,
    inviteCode,
    qualtricsId,
}: {
    userUniqueKey: string;
    inviteCode: string;
    qualtricsId?: string;
}) {
    const [userKey, setUserKey] = useState<string | null>();
    const GUEST_UNIQUE_KEY = 'userUniqueKey';
    const GUEST_QUALTRICS_ID = 'guestQualtricsId';

    const router = useRouter();

    // 设置用户ID到状态和localStorage
    const setAndStoreKey = useCallback((key: string, val: string) => {
        const now = new Date();
        const item = {
            value: val,
            expiry: now.getTime() + 86400000, // 设置24小时后过期
        };
        store.set(key, JSON.stringify(item));
        if (key === GUEST_UNIQUE_KEY) {
            setUserKey(val);
        }
    }, []);

    const combineKey = `${userKey}${inviteCode}`;

    useEffect(() => {
        // 尝试从 localStorage 获取用户ID
        // const itemStr = store.get(GUEST_UNIQUE_KEY);
        setAndStoreKey(GUEST_UNIQUE_KEY, userUniqueKey);

        // if (itemStr) {
        //     const item = JSON.parse(itemStr);
        //     const now = new Date();
        //     // 检查存储的用户ID是否过期
        //     if (now.getTime() > item.expiry) {
        //         // 已过期，设置新的用户ID并更新localStorage
        //         setAndStoreKey(GUEST_UNIQUE_KEY, userUniqueKey);
        //     } else {
        //         // 未过期，使用localStorage中的用户ID
        //         setUserKey(item.value);
        //     }
        // } else {
        //     // localStorage中没有用户ID，设置新的用户ID
        //     setAndStoreKey(GUEST_UNIQUE_KEY, userUniqueKey);
        // }
    }, [userUniqueKey, setAndStoreKey]);

    useEffect(() => {
        store.remove(GUEST_QUALTRICS_ID);
        setAndStoreKey(GUEST_QUALTRICS_ID, qualtricsId || '');
    }, [qualtricsId, setAndStoreKey]); // Separate effect for qualtricsId

    function onClick() {
        router.push(`/guest/dashboard/${combineKey}`);
    }

    return (
        <div className="flex flex-col space-y-12 text-center items-center">
            <h1 className="text-5xl font-semibold tracking-tight">欢迎进入写作平台</h1>
            {userKey && (
                <>
                    {/* <div className="text text-slate-500 dark:text-slate-400">
                        这是您本次实验的唯一ID{'  '}
                        <kbd className="kbd kbd-md">{userKey}</kbd>
                        请牢记在心
                    </div> */}

                    <button className="btn btn-primary w-[300px]" onClick={onClick}>
                        开始
                    </button>
                </>
            )}
        </div>
    );
}
