import LoadingSpin from '@/components/common/loading-spin';

export default function Loading() {
    return (
        <div className="mx-auto flex flex-col space-y-4 items-center bg-white">
            <LoadingSpin variant="circle" />
        </div>
    );
}
