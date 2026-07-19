import type { Request, Response, NextFunction } from 'express';
import { createSupabaseClient } from '../config/supabaseClient.js';

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const supabase = createSupabaseClient(req, res);
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user)
            return res.status(401).json({ error: 'Invalid token' });

        req.user = { id: user.id };
        return next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}
