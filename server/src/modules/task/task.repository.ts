import prisma from '../../config/prismaClient.js';
import { CreateTaskInput, UpdateTaskInput } from './task.types.js';

const userBrief = {
    select: {
        id: true,
        fullName: true,
        avatarUrl: true,
    },
};

function createTask(data: CreateTaskInput) {
    return prisma.task.create({ data });
}

function findTaskById(id: string) {
    return prisma.task.findUnique({ where: { id } });
}

function deleteTask(id: string) {
    return prisma.task.delete({ where: { id } });
}

function updateTask(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
        where: { id },
        data,
    });
}

function findTasksByCourse(courseId: string, status?: 'DRAFT' | 'PUBLISHED') {
    return prisma.task.findMany({
        where: { courseId, status },
        orderBy: { deadline: 'asc' },
    });
}

function setTaskAttachments(id: string, attachments: string[]) {
    return prisma.task.update({
        where: { id },
        data: { attachments },
    });
}

function findSubmission(taskId: string, studentId: string) {
    return prisma.submission.findUnique({
        where: { taskId_studentId: { taskId, studentId } },
    });
}

function gradeSubmission(
    taskId: string,
    studentId: string,
    score?: number,
    feedback?: string,
) {
    return prisma.submission.update({
        where: { taskId_studentId: { taskId, studentId } },
        data: { score, feedback, status: 'GRADED', gradedAt: new Date() },
    });
}

function createOrUpdateSubmission(
    taskId: string,
    studentId: string,
    attachments: string[],
    content?: string,
) {
    return prisma.submission.upsert({
        where: { taskId_studentId: { taskId, studentId } },
        create: { taskId, studentId, attachments, content },
        update: { attachments, content, submittedAt: new Date() },
    });
}

async function findTaskSubmissionsWithMembers(
    taskId: string,
    courseId: string,
) {
    const [members, submissions] = await Promise.all([
        prisma.courseMember.findMany({
            where: { courseId },
            include: { user: userBrief },
            orderBy: { user: { fullName: 'asc' } },
        }),
        prisma.submission.findMany({ where: { taskId } }),
    ]);

    const byStudent = new Map(submissions.map((s) => [s.studentId, s]));

    let submittedCount = 0;
    let gradedCount = 0;
    let needsGradingCount = 0;

    for (const member of members) {
        const submission = byStudent.get(member.userId);
        if (!submission) continue;
        submittedCount++;

        if (submission.status === 'GRADED') {
            gradedCount++;
        } else {
            needsGradingCount++;
        }
    }

    return {
        summary: {
            totalMembers: members.length,
            submittedCount,
            pendingCount: members.length - submittedCount,
            gradedCount,
            needsGradingCount,
        },
        students: members.map((member) => ({
            ...member.user,
            submission: byStudent.get(member.userId) ?? null,
        })),
    };
}

function findLatestTask(userId: string) {
    return prisma.task.findFirst({
        where: {
            OR: [
                { createdById: userId },
                {
                    createdById: { not: userId },
                    status: 'PUBLISHED',
                    course: { members: { some: { userId } } },
                },
            ],
        },
        orderBy: { createdAt: 'desc' },
        include: { course: { select: { name: true } } },
    });
}

function findUserTasks(userId: string) {
    return prisma.task.findMany({
        where: {
            status: 'PUBLISHED',
            course: { members: { some: { userId } } },
        },
        include: {
            course: { select: { name: true } },
            submissions: { where: { studentId: userId }, take: 1 },
        },
        orderBy: { deadline: 'asc' },
    });
}

function findTasksToGrade(userId: string) {
    return prisma.task.findMany({
        where: {
            createdById: userId,
            submissions: { some: { status: 'SUBMITTED' } },
        },
        select: {
            id: true,
            title: true,
            type: true,
            deadline: true,
            courseId: true,
            course: { select: { name: true } },
            _count: {
                select: { submissions: { where: { status: 'SUBMITTED' } } },
            },
        },
        orderBy: { deadline: 'asc' },
    });
}

export {
    createTask,
    findTaskById,
    deleteTask,
    updateTask,
    findTasksByCourse,
    setTaskAttachments,
    findSubmission,
    gradeSubmission,
    createOrUpdateSubmission,
    findTaskSubmissionsWithMembers,
    findLatestTask,
    findUserTasks,
    findTasksToGrade,
};
