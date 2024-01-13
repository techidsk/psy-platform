'use client';
import { Icons } from '@/components/icons';

import { ProjectCreateHeader } from '@/components/project/project-create-header';
import { ProjectCreateForm } from '@/components/project/project-create-form';
import { useRouter } from 'next/navigation';

export default function UserForm() {
    const router = useRouter();
    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <div className="mb-4">
                <button className="btn btn-ghost" onClick={() => router.back()}>
                    <Icons.back />
                    返回
                </button>
            </div>
            <div className="flex flex-col gap-4">
                <ProjectCreateHeader heading="创建新项目" />
                <ProjectCreateForm className="w-full px-2" />
            </div>
        </div>
    );
}
