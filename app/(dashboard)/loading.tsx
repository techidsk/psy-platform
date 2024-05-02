import { LoadingSpin } from '@/components/common/loading';

export default function Loading() {
    return (
        <div className="mx-auto flex flex-col space-y-4 items-center bg-white">
            <LoadingSpin />
        </div>
    );
}
