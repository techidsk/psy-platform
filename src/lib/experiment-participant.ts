import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function getParticipantId(guest: boolean, guestNanoId: unknown) {
    if (guest) {
        if (typeof guestNanoId !== 'string' || !guestNanoId) return null;
        const user = await db.user.findFirst({
            where: { nano_id: guestNanoId, user_role: 'GUEST', deleted: 0 },
            select: { id: true },
        });
        return user?.id ?? null;
    }
    const user = await getCurrentUser();
    return Number(user?.id) || null;
}
