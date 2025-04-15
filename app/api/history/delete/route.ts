import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { logger } from '@/lib/logger';

const deleteSchema = z.object({
    id: z.number(), // ID of the user_experiments record
});

export async function POST(req: Request) {
    try {
        const currentUser = await getCurrentUser();

        // Basic authorization: Only allow ADMIN or ASSISTANT roles
        if (!currentUser || !['ADMIN', 'ASSISTANT'].includes(currentUser.role)) {
            logger.warn('Unauthorized attempt to delete user experiment history', {
                userId: currentUser?.id,
                role: currentUser?.role,
            });
            return new NextResponse('Unauthorized', { status: 403 });
        }

        const json = await req.json();
        const body = deleteSchema.parse(json);
        console.log(body);
        // Perform logical delete: Update is_deleted to 1
        const updatedExperiment = await db.user_experiments.update({
            where: {
                id: body.id,
                // Optional: Add manager_id check for ASSISTANT role for more granular control
                // ...(currentUser.role === 'ASSISTANT' ? { manager_id: currentUser.id } : {}),
            },
            data: {
                is_deleted: 1, // Set is_deleted flag to 1
            },
        });

        if (!updatedExperiment) {
            logger.warn('User experiment history record not found for deletion', {
                id: body.id,
                userId: currentUser.id,
            });
            return new NextResponse('Record not found', { status: 404 });
        }

        logger.info('User experiment history logically deleted', {
            id: body.id,
            userId: currentUser.id,
        });
        return NextResponse.json({ success: true, id: updatedExperiment.id });
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('Invalid request payload for deleting user experiment history', {
                errors: error.issues,
            });
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        logger.error('Error deleting user experiment history', { error });
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
