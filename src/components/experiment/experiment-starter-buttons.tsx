'use client';

import { useEffect, useState } from 'react';
import { getUrl } from '@/lib/url';
import { useRouter } from 'next/navigation';
import store from 'store2';
import { Modal } from '../ui/modal';
import { UserPrivacyForm } from '../user/user-privacy-modal';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId?: string;
    projectGroupId?: string;
    showUserPrivacy?: boolean;
    userId?: number;
    guest?: boolean;
    userUniqueKey?: string;
}

export function ExperimentStarterButtons({
    experimentId: experimentNanoId, // 实验 nano_id
    showUserPrivacy,
    userId,
    userUniqueKey,
    guest = false,
}: Buttons) {
    const [open, setOpen] = useState(false);

    const router = useRouter();

    async function insertGuestUser() {
        const response = await fetch(getUrl('/api/guest/add'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nano_id: userUniqueKey,
            }),
        });
        const responeData = await response.json();
        return responeData.data;
    }

    async function startExperiment() {
        if (guest) {
            // 游客模式需要创建用户,才能继续进行操作
            const guestId = await insertGuestUser();
        }
        // 创建实验，然后跳转到对应的路径
        const result = await fetch(getUrl('/api/user/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: experimentNanoId,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            const userExperimentNanoId = responseBody.data.userExperimentNanoId;
            router.push(`/experiments/input/${userExperimentNanoId}`);
            userExperimentNanoId && store('experimentId', userExperimentNanoId);
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
