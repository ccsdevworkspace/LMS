import prisma from '../../config/prismaClient.js';
import { CreateCourseInput } from './course.types.js';

const userBrief = {
    select: {
        id: true,
        fullName: true,
        avatarUrl: true,
    },
};

function createCourse(data: CreateCourseInput & { createdById: string }) {
    return prisma.course.create({ data, include: { createdBy: userBrief } });
}

function findCourseById(id: string) {
    return prisma.course.findUnique({
        where: { id },
        include: { createdBy: userBrief },
    });
}

function deleteCourse(id: string) {
    return prisma.course.delete({ where: { id } });
}

function findCourseByJoinCode(joinCode: string) {
    return prisma.course.findFirst({
        where: { joinCode: { equals: joinCode, mode: 'insensitive' } },
        include: { createdBy: userBrief },
    });
}

function findCourseOwnerId(id: string) {
    return prisma.course.findUnique({
        where: { id },
        select: { createdById: true },
    });
}

function findCoursesForUser(userId: string) {
    return prisma.course.findMany({
        where: {
            OR: [{ createdById: userId }, { members: { some: { userId } } }],
        },
        include: { createdBy: userBrief },
        orderBy: { createdAt: 'desc' },
    });
}

function findCourseWithMembers(id: string) {
    return prisma.course.findUnique({
        where: { id },
        include: { members: { include: { user: userBrief } } },
    });
}

function findCourseMembership(courseId: string, userId: string) {
    return prisma.courseMember.findUnique({
        where: { courseId_userId: { courseId, userId } },
    });
}

function addCourseMember(courseId: string, userId: string) {
    return prisma.courseMember.create({ data: { courseId, userId } });
}

function removeCourseMember(courseId: string, userId: string) {
    return prisma.courseMember.delete({
        where: { courseId_userId: { courseId, userId } },
    });
}

export {
    createCourse,
    findCourseById,
    deleteCourse,
    findCourseByJoinCode,
    findCourseOwnerId,
    findCoursesForUser,
    findCourseWithMembers,
    findCourseMembership,
    addCourseMember,
    removeCourseMember,
};
