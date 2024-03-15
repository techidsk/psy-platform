'use client';

import { useEffect, useState } from 'react';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { Modal } from '../ui/modal';
import { UserPrivacyForm } from '../user/user-privacy-modal';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId?: string;
    showUserPrivacy?: boolean;
    userId?: number;
}

export function ExperimentStarterButtons({
    experimentId, // 实验 nano_id
    showUserPrivacy,
    userId,
    children,
}: Buttons) {
    const [open, setOpen] = useState(false);

    const router = useRouter();

    async function startExperiment() {
        // 创建实验，然后跳转到对应的路径
        const result = await fetch(getUrl('/api/user/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: experimentId,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            const newExperimentId = responseBody.data.experimentNanoId;
            router.push(`/experiments/input/${newExperimentId}`);
            // 保存实验id
            newExperimentId && store('experimentId', newExperimentId);
        }
    }

    function handleToggle() {
        setOpen(!open);
    }
    function closeModel() {
        setOpen(false);
    }

    useEffect(() => {
        if (showUserPrivacy) {
            setOpen(true);
        }
    }, []);

    return (
        <>
            <div className="flex flex-col gap-4">
                <button className="btn btn-primary" onClick={startExperiment}>
                    开始测验
                </button>
            </div>
            {open && (
                <Modal
                    className="flex flex-col gap-4"
                    open={open}
                    onClose={handleToggle}
                    disableClickOutside={!open}
                >
                    <h1 className="text-xl">编辑用户</h1>
                    <UserPrivacyForm closeModal={closeModel} userId={userId} />
                </Modal>
            )}
        </>
    );
}
