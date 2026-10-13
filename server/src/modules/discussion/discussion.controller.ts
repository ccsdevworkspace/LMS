import { Request, Response, NextFunction } from 'express';
import { createMessageSchema } from './discussion.types.js';
import * as discussionService from './discussion.service.js';

export async function getMessagesHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id } = req.params;
        const result = await discussionService.getCourseMessages(
            id,
            req.user.id,
        );

        if (result.error === 'not_found') {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (result.error === 'forbidden') {
            return res
                .status(403)
                .json({ error: 'You are not a member of this course' });
        }

        return res.json({ messages: result.messages });
    } catch (error) {
        next(error);
    }
}

export async function createMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id } = req.params;
        const parsed = createMessageSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: parsed.error.issues[0]?.message || 'Invalid message',
            });
        }

        const result = await discussionService.sendCourseMessage(
            id,
            req.user.id,
            parsed.data.content,
        );

        if (result.error === 'not_found') {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (result.error === 'forbidden') {
            return res
                .status(403)
                .json({ error: 'You are not a member of this course' });
        }

        return res.status(201).json({ message: result.message });
    } catch (error) {
        next(error);
    }
}

export async function deleteMessageHandler(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { id, messageId } = req.params;
        const result = await discussionService.deleteCourseMessage(
            id,
            messageId,
            req.user.id,
        );

        if (result.error === 'not_found') {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (result.error === 'forbidden') {
            return res.status(403).json({
                error: 'You do not have permission to delete this message',
            });
        }

        return res.status(204).send();
    } catch (error) {
        next(error);
    }
}
