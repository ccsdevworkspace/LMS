import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
) {
    const { name, code, status, message } = err as {
        name?: string;
        code?: string;
        status?: number;
        message?: string;
    };

    if (typeof status === 'number' && status >= 400 && status < 600) {
        return res.status(status).json({ error: message || 'Error occurred' });
    }

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
