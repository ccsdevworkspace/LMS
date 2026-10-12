import prisma from '../../config/prismaClient.js';

async function create(userId: string, title: string) {
    return prisma.todo.create({
        data: { userId, title },
    });
}

async function remove(id: string, userId: string) {
    const { count } = await prisma.todo.deleteMany({ where: { id, userId } });
    return count > 0;
}

async function getAll(userId: string) {
    return prisma.todo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
}

export { create, remove, getAll };
