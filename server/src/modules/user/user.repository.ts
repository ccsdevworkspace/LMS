import prisma from '../../config/prismaClient.js';

export async function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
    });
}
