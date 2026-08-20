import {
    createCourse,
    findCourseByJoinCode,
    findCourseMembership,
    addCourseMember,
    removeCourseMember,
} from './course.repository.js';
import { CreateCourseInput } from './course.types.js';

async function createCourseService(input: CreateCourseInput, userId: string) {
    const course = await createCourse({ ...input, createdById: userId });
    return { course };
}

async function joinCourseByCode(code: string, userId: string) {
    const course = await findCourseByJoinCode(code);

    if (!course) {
        return { error: 'not_found' as const };
    }

    if (course.createdById === userId) {
        return { error: 'is_creator' as const };
    }

    if (await findCourseMembership(course.id, userId)) {
        return { error: 'already_joined' as const };
    }

    await addCourseMember(course.id, userId);
    return { course };
}

async function leaveCourse(courseId: string, userId: string) {
    if (!(await findCourseMembership(courseId, userId))) {
        return { error: 'not_member' as const };
    }
    await removeCourseMember(courseId, userId);
}

export { createCourseService, joinCourseByCode, leaveCourse };
