import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { upload } from '../../middleware/upload.js';
import {
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
} from './task.controller.js';

const router = Router();

router.use(authenticate);

router.post(
    '/courses/:courseId/tasks',
    upload.array('files', 10),
    createTaskHandler,
);
router.get('/courses/:courseId/tasks', listTasksHandler);
router.get('/tasks', myTasksHandler);
router.get('/tasks/latest', latestTaskHandler);
router.get('/tasks/:id', getTaskHandler);
router.patch('/tasks/:id', updateTaskHandler);
router.delete('/tasks/:id', deleteTaskHandler);

router.post('/tasks/:id/submit', upload.single('file'), submitTaskHandler);
router.get('/tasks/:id/submissions', getSubmissionsHandler);
router.patch('/tasks/:id/submissions/:studentId', gradeSubmissionHandler);

export default router;
