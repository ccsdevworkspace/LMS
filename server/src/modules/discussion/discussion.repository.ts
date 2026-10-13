import prisma from '../../config/prismaClient.js';

const userBrief = {
    select: {
        id: true,
        fullName: true,
        avatarUrl: true,
    },
};

export async function findCourseMessages(courseId: string) {
    return (prisma as any).discussionMessage.findMany({
        where: { courseId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: userBrief,
        },
    });
}

export async function createDiscussionMessage(
    courseId: string,
    senderId: string,
    content: string,
) {
    return (prisma as any).discussionMessage.create({
        data: {
            courseId,
            senderId,
            content,
        },
        include: {
            sender: userBrief,
        },
    });
}

export async function findMessageById(messageId: string) {
    return (prisma as any).discussionMessage.findUnique({
        where: { id: messageId },
    });
}

export async function deleteDiscussionMessage(messageId: string) {
    return (prisma as any).discussionMessage.delete({
        where: { id: messageId },
    });
}
