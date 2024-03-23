'use client';
import { getUrl } from '@/lib/url';

export default function GuestModeChecker() {
    async function changeGusetMode() {
        await fetch(getUrl('/api/platform/guest'));
    }

    return (
        <>
            <span>开启游客模式</span>
            <div className="form-control">
                <label className="label cursor-pointer">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        onChange={changeGusetMode}
                    />
                </label>
            </div>
        </>
    );
}
