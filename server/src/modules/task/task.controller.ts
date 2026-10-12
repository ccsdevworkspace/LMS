import { Request, Response } from 'express';
import {
    createTaskSchema,
    updateTaskSchema,
    gradeSubmissionSchema,
} from './task.types.js';
import {
    createCourseTask,
    listCourseTasks,
    getTaskDetail,
    updateCourseTask,
    deleteCourseTask,
    submitTaskWork,
    getTaskSubmissions,
    gradeTaskSubmission,
} from './task.service.js';
import {
    findLatestTask,
    findUserTasks,
    findTasksToGrade,
} from './task.repository.js';

async function createTaskHandler(req: Request, res: Response) {
    const taskData = createTaskSchema.parse({
        ...req.body,
        publish: String(req.body.publish) === 'true',
    });
    const files = (req.files as Express.Multer.File[]) || [];

    const task = await createCourseTask(
        req.params.courseId,
        req.user.id,
        taskData,
        files,
    );

    res.status(201).json({ task });
}

async function listTasksHandler(req: Request, res: Response) {
    const tasks = await listCourseTasks(req.params.courseId, req.user.id);
    return res.status(200).json({ tasks });
}

async function getTaskHandler(req: Request, res: Response) {
    const data = await getTaskDetail(req.params.id, req.user.id);
    return res.status(200).json(data);
}

async function updateTaskHandler(req: Request, res: Response) {
    const updates = updateTaskSchema.parse(req.body);
    const task = await updateCourseTask(req.params.id, req.user.id, updates);
    return res.status(200).json({ task });
}

async function deleteTaskHandler(req: Request, res: Response) {
    await deleteCourseTask(req.params.id, req.user.id);
    return res.status(200).json({ message: 'Task deleted' });
}

async function submitTaskHandler(req: Request, res: Response) {
    const content: string | undefined = req.body?.content;

    const submission = await submitTaskWork(
        req.params.id,
        req.user.id,
        content,
        req.file,
    );

    return res.status(201).json({ submission });
}

async function getSubmissionsHandler(req: Request, res: Response) {
    const data = await getTaskSubmissions(req.params.id, req.user.id);
    return res.status(200).json(data);
}

async function latestTaskHandler(req: Request, res: Response) {
    const task = await findLatestTask(req.user.id);
    return res.status(200).json({ task });
}

async function myTasksHandler(req: Request, res: Response) {
    const [tasks, gradingTasks] = await Promise.all([
        findUserTasks(req.user.id),
        findTasksToGrade(req.user.id),
    ]);

    return res.status(200).json({
        tasks: tasks.map(({ submissions, ...task }) => ({
            ...task,
            mySubmission: submissions[0] ?? null,
        })),
        grading: gradingTasks.map((task) => ({
            taskId: task.id,
            taskTitle: task.title,
            taskType: task.type,
            courseId: task.courseId,
            courseName: task.course.name,
            deadline: task.deadline,
            toGrade: task._count.submissions,
        })),
    });
}

async function gradeSubmissionHandler(req: Request, res: Response) {
    const parsed = gradeSubmissionSchema.parse(req.body);

    const submission = await gradeTaskSubmission(
        req.params.id,
        req.params.studentId,
        req.user.id,
        parsed.score,
        parsed.feedback,
    );

    return res.status(200).json({ submission });
}

export {
    createTaskHandler,
    listTasksHandler,
    getTaskHandler,
    updateTaskHandler,
    deleteTaskHandler,
    submitTaskHandler,
    getSubmissionsHandler,
    gradeSubmissionHandler,
    latestTaskHandler,
    myTasksHandler,
};
