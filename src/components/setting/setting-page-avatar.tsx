'use client';
import { UserAvatarUploadButton } from '@/components/user/user-avatar-upload-button';
import { useState } from 'react';
import { getAvatarUrl } from '@/lib/logic/avatar';
import { type HeaderUserInfo } from '@/lib/logic/user';
import { Avatar } from '@/components/ui/avatar';
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
        setResultAvatarUrl(
            getAvatarUrl(`psy://avatar/${user.username}`, user.username || '') +
                `&update=${new Date().getTime()}`
        ); // 非常nerd code
    };

    return (
        <>
            <Avatar src={resultAvatarUrl} size="lg" />
            <div
                className="flex flex-col align-middle w-16 md:w-18 lg:w-20"
                data-id="upload-button"
            >
                <UserAvatarUploadButton user={user} updateFuc={updateImage} />
            </div>
        </>
    );
}
