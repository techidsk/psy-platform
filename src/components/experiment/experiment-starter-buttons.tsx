'use client';

import { useEffect, useState } from 'react';
import { getUrl } from '@/lib/url';
import { redirect, useRouter } from 'next/navigation';
import store from 'store2';
import { Modal } from '../ui/modal';
import { UserPrivacyForm } from '../user/user-privacy-modal';
import { logger } from '@/lib/logger';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId?: string;
    projectGroupId?: string;
    showUserPrivacy?: boolean;
    userId?: number;
    guest?: boolean;
    guestUserNanoId?: string;
}

export function ExperimentStarterButtons({
    experimentId: experimentNanoId, // 实验 nano_id
    showUserPrivacy,
    userId,
    guestUserNanoId,
    guest = false,
}: Buttons) {
    const [open, setOpen] = useState(false);

    const router = useRouter();
    const GUEST_UNIQUE_KEY = 'userUniqueKey';
    let userUniqueKey = '';
    if (guest) {
        const itemStr = store.get(GUEST_UNIQUE_KEY);
        if (!itemStr) {
            redirect('/guest');
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        // 检查存储的用户ID是否过期
        if (now.getTime() > item.expiry) {
            redirect('/guest');
        }
        userUniqueKey = item.value;
        if (!userUniqueKey) {
            redirect('/guest');
        }
    }

    async function startExperiment() {
        // 创建实验，然后跳转到对应的路径
        const result = await fetch(getUrl('/api/user/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: experimentNanoId,
                guest: guest,
                guestUserNanoId: guestUserNanoId,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            const userExperimentNanoId = responseBody.data.userExperimentNanoId;
            logger.info(`guest: ${guest}`);
            if (guest) {
                router.push(`/guest/input/${userUniqueKey}?e=${userExperimentNanoId}`);
            } else {
                router.push(`/experiments/input/${userExperimentNanoId}`);
            }
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
                    <UserPrivacyForm closeModal={closeModel} userId={userId} guest={guest} />
                </Modal>
            )}
        </>
    );
}
