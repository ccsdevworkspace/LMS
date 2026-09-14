import {
    streamClient,
    STREAM_PUBLIC_API_KEY,
} from '../../config/streamClient.js';
import {
    findCourseById,
    findCourseMembership,
} from '../course/course.repository.js';
import {
    findActiveLiveClassByCourseId,
    createLiveClassRecord,
    endLiveClassRecord,
    findUserById,
} from './live-class.repository.js';

export async function verifyCourseAccess(courseId: string, userId: string) {
    const course = await findCourseById(courseId);
    if (!course) {
        const error = new Error('Course not found');
        (error as any).status = 404;
        throw error;
    }

    const isOwner = course.createdById === userId;
    if (isOwner) {
        return { course, isOwner: true };
    }

    const membership = await findCourseMembership(courseId, userId);
    if (!membership) {
        const error = new Error('You do not have access to this course');
        (error as any).status = 403;
        throw error;
    }

    return { course, isOwner: false };
}

export async function getLiveClassStatusService(
    courseId: string,
    userId: string,
) {
    const { course, isOwner } = await verifyCourseAccess(courseId, userId);
    const activeClass = await findActiveLiveClassByCourseId(courseId);

    if (!activeClass) {
        return {
            active: false,
            course: {
                id: course.id,
                name: course.name,
                section: course.section,
                createdById: course.createdById,
            },
            isOwner,
        };
    }

    return {
        active: true,
        liveClass: {
            id: activeClass.id,
            callId: activeClass.callId,
            hostId: activeClass.hostId,
            host: activeClass.host,
            startedAt: activeClass.startedAt,
        },
        course: {
            id: course.id,
            name: course.name,
            section: course.section,
            createdById: course.createdById,
        },
        isOwner,
    };
}

export async function createLiveClassService(courseId: string, userId: string) {
    const { course, isOwner } = await verifyCourseAccess(courseId, userId);
    if (!isOwner) {
        const error = new Error(
            'Only the course instructor can start a live class',
        );
        (error as any).status = 403;
        throw error;
    }

    const user = await findUserById(userId);
    const callId = `class_${courseId}_${Date.now()}`;

    // Upsert host user into Stream
    try {
        await streamClient.upsertUsers([
            {
                id: userId,
                name: user?.fullName || 'Instructor',
                image: user?.avatarUrl || undefined,
                role: 'admin',
            },
        ]);
    } catch (err) {
        console.warn('Could not upsert user to Stream:', err);
    }

    // Create call in Stream Video
    try {
        const call = streamClient.video.call('default', callId);
        await call.getOrCreate({
            data: {
                created_by_id: userId,
                custom: {
                    courseId,
                    courseName: course.name,
                    section: course.section || '',
                },
            },
        });
    } catch (err) {
        console.error('Error creating Stream call:', err);
        const error = new Error('Failed to create live conference session');
        (error as any).status = 500;
        throw error;
    }

    // Record active class in database
    const record = await createLiveClassRecord({
        courseId,
        callId,
        hostId: userId,
    });

    const token = streamClient.createToken(userId);

    return {
        success: true,
        callId,
        liveClass: record,
        apiKey: STREAM_PUBLIC_API_KEY,
        token,
        user: {
            id: userId,
            name: user?.fullName || 'Instructor',
            image: user?.avatarUrl || undefined,
        },
    };
}

export async function endLiveClassService(courseId: string, userId: string) {
    const { isOwner } = await verifyCourseAccess(courseId, userId);
    if (!isOwner) {
        const error = new Error(
            'Only the course instructor can end the live class',
        );
        (error as any).status = 403;
        throw error;
    }

    const activeClass = await findActiveLiveClassByCourseId(courseId);
    if (activeClass) {
        try {
            const call = streamClient.video.call('default', activeClass.callId);
            await call.end();
        } catch (err) {
            console.warn('Stream call end error (may already be ended):', err);
        }

        await endLiveClassRecord(courseId);
    }

    return { success: true };
}

export async function getLiveClassTokenService(
    courseId: string,
    userId: string,
) {
    const { isOwner } = await verifyCourseAccess(courseId, userId);
    const user = await findUserById(userId);

    // Upsert participant user to Stream
    try {
        await streamClient.upsertUsers([
            {
                id: userId,
                name: user?.fullName || 'Student',
                image: user?.avatarUrl || undefined,
                role: isOwner ? 'admin' : 'user',
            },
        ]);
    } catch (err) {
        console.warn('Could not upsert user to Stream:', err);
    }

    const token = streamClient.createToken(userId);

    return {
        token,
        apiKey: STREAM_PUBLIC_API_KEY,
        user: {
            id: userId,
            name: user?.fullName || 'User',
            image: user?.avatarUrl || undefined,
        },
    };
}
