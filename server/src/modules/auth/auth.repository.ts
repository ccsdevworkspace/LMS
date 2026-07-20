import prisma from '../../config/prismaClient.js';

export async function saveUser(user: {
    id: string;
    fullName: string;
    avatarUrl: string;
}) {
    return prisma.user.upsert({
        where: { id: user.id },
        create: user,
        update: {},
    });
}
