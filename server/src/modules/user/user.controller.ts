import type { Request, Response } from 'express';
import { getUserById } from './user.repository.js';

export async function getProfile(req: Request, res: Response) {
    try {
        const user = await getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ user });
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
}
