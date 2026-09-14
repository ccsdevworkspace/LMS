import type { Request, Response, NextFunction } from 'express';
import {
    getLiveClassStatusService,
    createLiveClassService,
    endLiveClassService,
    getLiveClassTokenService,
} from './live-class.service.js';

export async function getStatusHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await getLiveClassStatusService(courseId, userId);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

export async function createLiveClassHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await createLiveClassService(courseId, userId);
        return res.status(201).json(data);
    } catch (err) {
        return next(err);
    }
}

export async function endLiveClassHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await endLiveClassService(courseId, userId);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

export async function getTokenHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = await getLiveClassTokenService(courseId, userId);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}
