'use client';

import { useEffect, useState } from 'react';
import { getUrl } from '@/lib/url';
import { redirect, usePathname, useRouter } from 'next/navigation';
import store from 'store2';
import { Modal } from '../ui/modal';
import { UserPrivacyForm } from '../user/user-privacy-modal';
import { logger } from '@/lib/logger';

interface Buttons extends React.HTMLAttributes<HTMLDivElement> {
    experimentId?: string;
    showUserPrivacy?: boolean;
    userId?: number;
    guest?: boolean;
    guestUserNanoId?: string;
    action: Function; // 点击完成后的操作
    currentStepIndex?: number;
    nextStepIndex?: number;
    userExperimentNanoId?: string;
}

export function ExperimentStarterButtons({
    experimentId: experimentNanoId, // 实验 nano_id
    showUserPrivacy,
    userId,
    guestUserNanoId,
    currentStepIndex,
    nextStepIndex,
    guest = false,
    userExperimentNanoId: prevUserExperimentNanoId,
}: Buttons) {
    const [open, setOpen] = useState(false);

    const router = useRouter();
    const pathname = encodeURIComponent(usePathname() as string);

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

    // 如果已经创建过userExperiment的 nanoId 则继续使用
    async function startExperiment() {
        // 创建实验，然后跳转到对应的路径
        const result = await fetch(getUrl('/api/user/experiment'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: experimentNanoId,
                guest: guest,
                guestUserNanoId: guestUserNanoId,
                prevUserExperimentNanoId: prevUserExperimentNanoId,
                part: currentStepIndex,
            }),
        });
        if (result.ok) {
            const responseBody = await result.json();
            const userExperimentNanoId = responseBody.data.userExperimentNanoId;
            logger.info(`guest: ${guest}`);
            if (guest) {
                if (currentStepIndex) {
                    // userUniqueKey 是 user 的nanoid
                    // userExperimentNanoId 是 userExperiment 的nanoid
                    // part 是实验的第几部分
                    // pathname 是实验完成之后跳转的地址
                    // nextStepIndex 是实验完成之后跳转步骤的索引

                    router.push(
                        `/guest/input/${userUniqueKey}?e=${userExperimentNanoId}&p=${currentStepIndex}&callback=${pathname}&next=${nextStepIndex}`
                    );
                } else {
                    router.push(
                        `/guest/input/${userUniqueKey}?e=${userExperimentNanoId}&callback=${pathname}&next=${nextStepIndex}`
                    );
                }
            } else {
                if (currentStepIndex) {
                    router.push(
                        `/experiments/input/${userExperimentNanoId}?p=${currentStepIndex}&callback=${pathname}&next=${nextStepIndex}`
                    );
                } else {
                    router.push(
                        `/experiments/input/${userExperimentNanoId}&callback=${pathname}&next=${nextStepIndex}`
                    );
                }
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
                    开始写作
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
