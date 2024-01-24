'use client';

import { toast } from '@/hooks/use-toast';
import { getUrl } from '@/lib/url';
import { type SyntheticEvent } from 'react';

interface UserAvatarUploadButton extends React.HTMLAttributes<HTMLButtonElement> {}
type User = {
    username: string;
    id: number; // 不是nano-id
    avatar: string;
};
type UserProps = {
    user: User;
};

/**
 * 上传用户头像按钮组件，出现在头像框上。
 * @todo 支持头像裁剪功能
 * @param param0
 * @returns
 */
export function UserAvatarUploadButton({ user, updateFuc }: UserProps): UserAvatarUploadButton {
    console.log(user);

    async function uploadTrigger() {
        const fileInput = document.getElementById('avatar-upload');

        fileInput?.click();
    }

    async function uploadFile(e: SyntheticEvent) {
        console.log(e);
        console.log(e.target.files);
        const targetFile: File = e.target.files[0];

        if (targetFile) {
            const formData = new FormData();

            formData.append('username', user.username);
            formData.append('type', targetFile.type);
            formData.append('userid', parseInt(user.id));
            formData.append('data', targetFile);

            console.log('prepare for uploading...');

            const response = await fetch(getUrl('/api/photo/avatar'), {
                method: 'POST',
                body: formData,
            });

            if (response.status == 200) {
                updateFuc();
                return toast({
                    title: '上传头像成功',
                    description: response.text,
                    variant: 'default',
                    duration: 5000,
                });
            } else {
                return toast({
                    title: '上传失败',
                    description: response.text,
                    variant: 'default',
                    duration: 5000,
                });
            }
        }
    }

    return (
        <>
            <button
                style={{
                    color: 'white',
                    background: 'rgb(6 5 6 / 70%)',
                    fontSize: 'small',
                    textAlign: 'center',
                }}
                onClick={uploadTrigger}
            >
                上传头像
            </button>
            <input
                id="avatar-upload"
                type="file"
                accept=".png, .jpg, .jpeg"
                style={{
                    display: 'none',
                }}
                onChange={uploadFile}
            ></input>
        </>
    );
}
