import { Request, Response, NextFunction } from 'express';
import {
    createCourseService,
    joinCourseByCode,
    leaveCourse,
} from './course.service.js';
import { createCourseSchema, joinCourseSchema } from './course.types.js';
import {
    findCourseById,
    findCourseOwnerId,
    findCoursesForUser,
    findCourseWithMembers,
    deleteCourse,
    removeCourseMember,
} from './course.repository.js';

async function createCourseHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const parsed = createCourseSchema.parse(req.body);
        const { course } = await createCourseService(parsed, req.user.id);
        return res.status(201).json({ course });
    } catch (error) {
        next(error);
    }
}

async function listCoursesHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const courses = await findCoursesForUser(req.user.id);
        return res.json({ courses });
    } catch (error) {
        next(error);
    }
}

async function getCourseHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const course = await findCourseById(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        return res.json({ course });
    } catch (error) {
        next(error);
    }
}

async function deleteCourseHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const course = await findCourseOwnerId(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.createdById !== req.user.id) {
            return res.status(403).json({
                error: 'Only the course creator can delete this course',
            });
        }

        await deleteCourse(req.params.id);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function joinCourseHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const parsed = joinCourseSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: 'Join code is required' });
        }

        const { code } = parsed.data;
        const userId = req.user.id;
        const result = await joinCourseByCode(code, userId);

        if (result.error === 'not_found') {
            return res.status(404).json({ error: 'Invalid course code' });
        }

        if (result.error === 'is_creator') {
            return res
                .status(400)
                .json({ error: 'You already own this course' });
        }

        if (result.error === 'already_joined') {
            return res
                .status(400)
                .json({ error: 'You already joined this course' });
        }

        return res.status(201).json({ course: result.course });
    } catch (error) {
        next(error);
    }
}

async function leaveCourseHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const result = await leaveCourse(req.params.id, req.user.id);

        if (result?.error) {
            return res.status(400).json({
                error: 'You are not a member of this course',
            });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function getMembersHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const course = await findCourseWithMembers(req.params.id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.createdById !== req.user.id) {
            return res.status(403).json({
                error: 'Only the course creator can view members',
            });
        }

        return res.json({ members: course.members });
    } catch (error) {
        next(error);
    }
}

async function removeMemberHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id, userId } = req.params;
        const course = await findCourseOwnerId(id);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (course.createdById !== req.user.id) {
            return res.status(403).json({
                error: 'Only the course creator can remove members',
            });
        }

        await removeCourseMember(id, userId);
        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export {
    createCourseHandler,
    listCoursesHandler,
    getCourseHandler,
    deleteCourseHandler,
    joinCourseHandler,
    leaveCourseHandler,
    getMembersHandler,
    removeMemberHandler,
};
