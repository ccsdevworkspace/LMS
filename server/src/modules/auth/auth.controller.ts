import { Request, Response } from 'express';
import { createSupabaseClient } from '../../config/supabaseClient.js';
import { initiateOAuth, handleOAuthCallback } from './auth.service.js';
import { env } from '../../config/env.config.js';

export async function handleOAuth(req: Request, res: Response) {
    try {
        const supabase = createSupabaseClient(req, res);
        const url = await initiateOAuth(supabase);

        return res.redirect(url);
    } catch (err) {
        console.error('OAuth failed:', err);
        return res.status(500).json({ error: 'OAuth failed' });
    }
}

export async function handleCallback(req: Request, res: Response) {
    try {
        const code = req.query.code as string;

        if (!code) {
            return res.status(400).json({ error: 'Missing code' });
        }

        const supabase = createSupabaseClient(req, res);
        await handleOAuthCallback(supabase, code);

        return res.redirect(env.allowedOrigin); //Web only. Multiple client redirects not yet supported
    } catch (err) {
        console.error('Callback error:', err);
        return res.redirect(`${env.allowedOrigin}/login?error=auth_failed`);
    }
}

export function getMe(req: Request, res: Response) {
    return res.json({ user: req.user });
}

export async function handleLogout(req: Request, res: Response) {
    try {
        const supabase = createSupabaseClient(req, res);
        const { error } = await supabase.auth.signOut();

        if (error) return res.status(500).json({ error: 'Logout failed' });

        return res.json({ message: 'Logged out' });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Logout failed' });
    }
}
