import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
    createCourseHandler,
    listCoursesHandler,
    getCourseHandler,
    deleteCourseHandler,
    joinCourseHandler,
    leaveCourseHandler,
    getMembersHandler,
    removeMemberHandler,
} from './course.controller.js';

const router = Router();

router.use(authenticate);

router.get('/courses', listCoursesHandler);
router.post('/courses', createCourseHandler);
router.get('/courses/:id', getCourseHandler);
router.delete('/courses/:id', deleteCourseHandler);
router.post('/courses/join', joinCourseHandler);
router.post('/courses/:id/leave', leaveCourseHandler);
router.get('/courses/:id/members', getMembersHandler);
router.delete('/courses/:id/members/:userId', removeMemberHandler);

export default router;
