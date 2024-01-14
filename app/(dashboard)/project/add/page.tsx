import { ProjectCreateForm } from '@/components/project/project-create-form';
import SubpageHeader, { SubpageContentHeader } from '@/components/subpage-header';

export default function UserForm() {
    return (
        <div className="container h-screen lg:max-w-none bg-white">
            <SubpageHeader />
            <div className="flex flex-col gap-4">
                <SubpageContentHeader heading="创建新项目" />
                <ProjectCreateForm className="w-full px-2" edit={true} />
            </div>
        </div>
    );
}
