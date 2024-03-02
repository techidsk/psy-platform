'use client';
import Image from 'next/image';
import { UserAvatarUploadButton } from '@/components/user/user-avatar-upload-button';
import { useState } from 'react';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { type HeaderUserInfo } from '@/lib/logic/user';
interface UserSetttingAvatar extends React.HTMLAttributes<HTMLButtonElement> {
    user: HeaderUserInfo;
}

export async function UserSetttingAvatar({ user }: UserSetttingAvatar) {
    const [resultAvatarUrl, setResultAvatarUrl] = useState(
        getAvatarUrl(user.avatar || '', user.username || '')
    );

    /**
     * 该函数总是在用户成功上传完头像后调用
     */
    const updateImage = () => {
        console.log('heelo');
        setResultAvatarUrl(
            getAvatarUrl(`psy://avatar/${user.username}`, user.username || '') +
                `&update=${new Date().getTime()}`
        ); // 非常nerd code
    };

    return (
        <>
            <Image
                src={resultAvatarUrl}
                alt=""
                height={96}
                width={96}
                className="rounded-full align-middle"
                // 默认height会是auto，导致计算结果不与width一致，导致图像未能呈圆框
                style={{ height: 96 }}
                loading="lazy"
                unoptimized
            />
            <div
                className="flex flex-col align-middle"
                data-id="upload-button"
                style={{ width: 96 }}
            >
                <UserAvatarUploadButton user={user} updateFuc={updateImage} />
            </div>
        </>
    );
}
