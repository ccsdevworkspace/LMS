import prisma from '../../config/prismaClient.js';
import * as discussionRepo from './discussion.repository.js';

export async function checkCourseAccess(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            members: {
                where: { userId },
                select: { id: true },
            },
        },
    });

    if (!course) {
        return null;
    }

    const isOwner = course.createdById === userId;
    const isMember = course.members.length > 0;

    return {
        course,
        hasAccess: isOwner || isMember,
        isOwner,
    };
}

export async function getCourseMessages(courseId: string, userId: string) {
    const access = await checkCourseAccess(courseId, userId);
    if (!access) {
        return { error: 'not_found' as const };
    }
    if (!access.hasAccess) {
        return { error: 'forbidden' as const };
    }

    const messages = await discussionRepo.findCourseMessages(courseId);
    return { messages };
}

export async function sendCourseMessage(
    courseId: string,
    userId: string,
    content: string,
) {
    const access = await checkCourseAccess(courseId, userId);
    if (!access) {
        return { error: 'not_found' as const };
    }
    if (!access.hasAccess) {
        return { error: 'forbidden' as const };
    }

    const message = await discussionRepo.createDiscussionMessage(
        courseId,
        userId,
        content,
    );
    return { message };
}

export async function deleteCourseMessage(
    courseId: string,
    messageId: string,
    userId: string,
) {
    const message = await discussionRepo.findMessageById(messageId);
    if (!message || message.courseId !== courseId) {
        return { error: 'not_found' as const };
    }

    const access = await checkCourseAccess(courseId, userId);
    if (!access || !access.hasAccess) {
        return { error: 'forbidden' as const };
    }

    if (message.senderId !== userId && !access.isOwner) {
        return { error: 'forbidden' as const };
    }

    await discussionRepo.deleteDiscussionMessage(messageId);
    return { success: true };
}
