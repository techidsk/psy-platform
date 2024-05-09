'use client';

import { toast } from '@/hooks/use-toast';
import { uploadPhotoWihInput } from '@/lib/api/post';
import { compressBlob, calculateHash } from '@/lib/logic/file';
import { getUrl } from '@/lib/url';
import { type HeaderUserInfo } from '@/lib/logic/user';

interface UserAvatarUploadButton extends React.HTMLAttributes<HTMLButtonElement> {
    user: HeaderUserInfo;
    updateFuc: () => void;
}
/**
 * 上传用户头像按钮组件，出现在头像框上。
 * @todo 支持头像裁剪功能
 * @param param0
 * @returns
 */
export function UserAvatarUploadButton({ user, updateFuc }: UserAvatarUploadButton) {
    async function uploadTrigger() {
        const fileInput = document.getElementById('avatar-upload');

        fileInput?.click();
    }

    /**
    async function uploadFile(e: SyntheticEvent) {
        const target = e.target as HTMLInputElement; // 类型断言
        if (!target.files || target.files.length === 0) {
            return; // 没有文件，直接返回
        }
        const targetFile: File = target.files[0];

        if (targetFile) {
            const formData = new FormData();

            formData.append('username', user.username || '');
            formData.append('type', targetFile.type);
            formData.append('userid', user.id.toString());
            formData.append('data', targetFile);


            const response = await fetch(getUrl('/api/photo/avatar'), {
                method: 'POST',
                body: formData,
            });

            if (response.status == 200) {
                updateFuc();
                return toast({
                    title: '上传头像成功',
                    description: <>{response.text}</>,
                    variant: 'default',
                    duration: 5000,
                });
            } else {
                return toast({
                    title: '上传失败',
                    description: <>{response.text}</>,
                    variant: 'default',
                    duration: 5000,
                });
            }
        }
    }
 */

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
                data-id="avatar-upload"
                type="file"
                accept=".png, .jpg, .jpeg"
                style={{
                    display: 'none',
                }}
                onChange={uploadPhotoWihInput}
            ></input>
        </>
    );
}
