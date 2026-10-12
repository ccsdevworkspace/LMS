import {
    findCourseOwnerId,
    findCourseMembership,
} from '../course/course.repository.js';
import {
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
} from './task.repository.js';
import { NewTaskInput, UpdateTaskInput } from './task.types.js';
import {
    uploadTask,
    uploadSubmission,
    getFileUrls,
} from '../../storage/storage.js';

function fail(status: number, message: string) {
    return Object.assign(new Error(message), { status });
}

async function signAttachments(item: { attachments: string[] }) {
    const urls = await getFileUrls(item.attachments);
    return { ...item, attachments: urls };
}

async function getOwnedTask(taskId: string, userId: string) {
    const task = await findTaskById(taskId);

    if (!task) throw fail(404, 'Task not found');
    if (task.createdById !== userId) throw fail(403, 'Forbidden');

    return task;
}

async function createCourseTask(
    courseId: string,
    userId: string,
    input: NewTaskInput,
    files: Express.Multer.File[],
) {
    const course = await findCourseOwnerId(courseId);

    if (!course) throw fail(404, 'Course Not Found');
    if (course.createdById !== userId) throw fail(403, 'Forbidden');

    if (input.publish && !input.deadline) {
        throw fail(400, 'Date is required to publish a task');
    }

    const deadline = input.deadline ? new Date(input.deadline) : null;
    const status = input.publish ? 'PUBLISHED' : 'DRAFT';

    let task = await createTask({
        courseId,
        createdById: userId,
        type: input.type,
        title: input.title,
        totalPoints: input.totalPoints,
        instructions: input.instructions,
        attachments: [],
        deadline,
        status,
    });

    if (files.length > 0) {
        const paths = await Promise.all(
            files.map((file) => uploadTask(courseId, task.id, file)),
        );
        task = await setTaskAttachments(task.id, paths);
    }

    return signAttachments(task);
}

async function listCourseTasks(courseId: string, userId: string) {
    const course = await findCourseOwnerId(courseId);

    if (!course) throw fail(404, 'Course Not Found');

    const isTeacher = course.createdById === userId;

    if (!isTeacher) {
        const membership = await findCourseMembership(courseId, userId);
        if (!membership) throw fail(403, 'Forbidden');
    }

    const tasks = await findTasksByCourse(
        courseId,
        isTeacher ? undefined : 'PUBLISHED',
    );

    return Promise.all(tasks.map((task) => signAttachments(task)));
}

async function getTaskDetail(taskId: string, userId: string) {
    const task = await findTaskById(taskId);

    if (!task) throw fail(404, 'Task not found');

    const isTeacher = task.createdById === userId;

    if (task.status === 'DRAFT' && !isTeacher) {
        throw fail(404, 'Task not found');
    }

    const submission = isTeacher ? null : await findSubmission(task.id, userId);

    const signedTask = await signAttachments(task);
    const signedSubmission = submission
        ? await signAttachments(submission)
        : null;

    return { task: signedTask, submission: signedSubmission };
}

async function updateCourseTask(
    taskId: string,
    userId: string,
    changes: UpdateTaskInput,
) {
    const task = await getOwnedTask(taskId, userId);
    const updated = await updateTask(task.id, changes);

    return signAttachments(updated);
}

async function deleteCourseTask(taskId: string, userId: string) {
    const task = await getOwnedTask(taskId, userId);

    await deleteTask(task.id);
}

async function submitTaskWork(
    taskId: string,
    userId: string,
    content: string | undefined,
    file: Express.Multer.File | undefined,
) {
    const task = await findTaskById(taskId);

    if (!task) throw fail(404, 'Task not found');

    const membership = await findCourseMembership(task.courseId, userId);
    if (!membership) throw fail(403, 'Forbidden');

    if (task.status !== 'PUBLISHED') {
        throw fail(400, 'This task is not open for submissions');
    }

    if (task.deadline && task.deadline.getTime() < Date.now()) {
        throw fail(400, 'The deadline for this task has passed');
    }

    const text = content?.trim();

    if (!file && !text) {
        throw fail(
            400,
            'Either written content or a file attachment is required',
        );
    }

    const attachments: string[] = [];

    if (file) {
        const path = await uploadSubmission(
            task.courseId,
            task.id,
            userId,
            file,
        );
        attachments.push(path);
    }

    const submission = await createOrUpdateSubmission(
        task.id,
        userId,
        attachments,
        text,
    );

    return signAttachments(submission);
}

async function getTaskSubmissions(taskId: string, userId: string) {
    const task = await getOwnedTask(taskId, userId);

    const data = await findTaskSubmissionsWithMembers(task.id, task.courseId);

    const students = await Promise.all(
        data.students.map(async (student) => {
            const submission = student.submission
                ? await signAttachments(student.submission)
                : null;

            return { ...student, submission };
        }),
    );

    return {
        task: await signAttachments(task),
        summary: data.summary,
        students,
    };
}

async function gradeTaskSubmission(
    taskId: string,
    studentId: string,
    userId: string,
    score?: number,
    feedback?: string,
) {
    const task = await getOwnedTask(taskId, userId);

    if (score != null && task.totalPoints != null && score > task.totalPoints) {
        throw fail(400, `Score cannot exceed ${task.totalPoints}`);
    }

    const submission = await gradeSubmission(
        taskId,
        studentId,
        score,
        feedback,
    );

    return signAttachments(submission);
}

export {
    createCourseTask,
    listCourseTasks,
    getTaskDetail,
    updateCourseTask,
    deleteCourseTask,
    submitTaskWork,
    getTaskSubmissions,
    gradeTaskSubmission,
};
