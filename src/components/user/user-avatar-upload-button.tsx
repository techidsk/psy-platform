'use client';

import { type SyntheticEvent } from 'react';

interface UserAvatarUploadButton extends React.HTMLAttributes<HTMLButtonElement> {}

export function UserAvatarUploadButton({ props }: UserAvatarUploadButton) {
    async function uploadTrigger() {
        const fileInput = document.getElementById('avatar-upload');

        fileInput?.click();
    }

    async function uploadFile(e: SyntheticEvent) {
        console.log(e);
        console.log(e.target.files);
        const targetFile = e.target.files[0];

        if (targetFile) {
        }
    }

    return (
        <>
            <button
                style={{
                    color: 'white',
                    background: 'rgb(6 5 6 / 70%)',
                    fontSize: 'small',
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
