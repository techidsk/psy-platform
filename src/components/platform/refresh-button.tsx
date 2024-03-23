'use client';
import { getUrl } from '@/lib/url';
import { Icons } from '../icons';
import { useRouter } from 'next/navigation';

export default function RefreshButton() {
    const router = useRouter();
    async function clickRefreshToken() {
        // Refresh token
        await fetch(getUrl('/api/platform/refresh/token'));
        router.refresh();
    }

    return (
        <button className="btn btn-sm" onClick={clickRefreshToken}>
            <Icons.refresh />
        </button>
    );
}
