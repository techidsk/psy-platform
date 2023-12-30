import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { dateFormat } from '@/lib/date';

const prisma = new PrismaClient()

async function getUsers() {
    const users = await prisma.psy_user.findMany()
    prisma.$disconnect()
    const formattedUsers = users.map((user) => ({
        ...user,
        create_time: dateFormat(user['create_time']),
        id: user['id'].toString(),
        user_group_id: user['user_group_id'].toString(),
    }));
    return formattedUsers
}

export async function GET(request) {
    const users = await getUsers()
    return NextResponse.json(users);
}