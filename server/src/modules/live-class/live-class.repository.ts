import prisma from '../../config/prismaClient.js';

const userBrief = {
    select: {
        id: true,
        fullName: true,
        avatarUrl: true,
    },
};

export async function findActiveLiveClassByCourseId(courseId: string) {
    return prisma.liveClass.findFirst({
        where: {
            courseId,
            status: 'ACTIVE',
        },
        include: {
            host: userBrief,
        },
        orderBy: {
            startedAt: 'desc',
        },
    });
}

export async function createLiveClassRecord(data: {
    courseId: string;
    callId: string;
    hostId: string;
}) {
    // End any existing active class for this course before creating a new one
    await prisma.liveClass.updateMany({
        where: {
            courseId: data.courseId,
            status: 'ACTIVE',
        },
        data: {
            status: 'ENDED',
            endedAt: new Date(),
        },
    });

    return prisma.liveClass.create({
        data: {
            courseId: data.courseId,
            callId: data.callId,
            hostId: data.hostId,
            status: 'ACTIVE',
        },
        include: {
            host: userBrief,
        },
    });
}

export async function endLiveClassRecord(courseId: string) {
    return prisma.liveClass.updateMany({
        where: {
            courseId,
            status: 'ACTIVE',
        },
        data: {
            status: 'ENDED',
            endedAt: new Date(),
        },
    });
}

export async function findUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            role: true,
        },
    });
}
