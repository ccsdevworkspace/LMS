import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    const { name, code } = err as { name?: string; code?: string };

    if (name === 'ZodError') {
        return res.status(400).json({ error: 'Validation failed' });
    }

    if (code === 'P2025') {
        return res.status(404).json({ error: 'Not found' });
    }

    if (code === 'P2002') {
        return res.status(409).json({ error: 'Already exists' });
    }

    console.error('Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}
