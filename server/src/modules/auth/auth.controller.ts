import { Request, Response } from 'express';
import { parseCookieHeader } from '@supabase/ssr';
import { createSupabaseClient } from '../../config/supabaseClient.js';
import { initiateOAuth, handleOAuthCallback } from './auth.service.js';
import { env } from '../../config/env.config.js';
import { isAllowedOrigin } from '../../config/cors.config.js';

export async function handleOAuth(req: Request, res: Response) {
    try {
        const rawReturnTo = req.query.returnTo as string | undefined;
        let validReturnTo: string | undefined;

        if (rawReturnTo) {
            try {
                const parsedUrl = new URL(rawReturnTo);
                if (isAllowedOrigin(parsedUrl.origin)) {
                    validReturnTo = parsedUrl.origin;
                }
            } catch {
                // Invalid URL format, ignore
            }
        }

        const crossSite = process.env.CROSS_SITE === 'true';
        const sameSite = crossSite ? 'none' : 'lax';
        const secure = crossSite || env.isProduction;

        if (validReturnTo) {
            res.cookie('oauth_return_to', validReturnTo, {
                httpOnly: true,
                secure,
                sameSite,
                maxAge: 10 * 60 * 1000,
                path: '/',
            });
        }

        const serverOrigin =
            env.baseUrl || `${req.protocol}://${req.get('host')}`;
        const supabase = createSupabaseClient(req, res);
        const url = await initiateOAuth(supabase, serverOrigin, validReturnTo);

        return res.redirect(url);
    } catch (err) {
        console.error('OAuth failed:', err);
        return res.status(500).json({ error: 'OAuth failed' });
    }
}

export async function handleCallback(req: Request, res: Response) {
    const cookies = parseCookieHeader(req.headers.cookie ?? '');
    const cookieReturnTo = cookies.find(
        (c) => c.name === 'oauth_return_to',
    )?.value;
    const rawReturnTo =
        (req.query.returnTo as string | undefined) || cookieReturnTo;

    let targetOrigin = env.allowedOrigin;
    if (rawReturnTo) {
        try {
            const parsedUrl = new URL(rawReturnTo);
            if (isAllowedOrigin(parsedUrl.origin)) {
                targetOrigin = parsedUrl.origin;
            }
        } catch {
            // Invalid URL format, fallback to default allowedOrigin
        }
    }

    const crossSite = process.env.CROSS_SITE === 'true';
    const sameSite = crossSite ? 'none' : 'lax';
    const secure = crossSite || env.isProduction;

    res.clearCookie('oauth_return_to', {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
    });

    try {
        const code = req.query.code as string;

        if (!code) {
            return res.status(400).json({ error: 'Missing code' });
        }

        const supabase = createSupabaseClient(req, res);
        await handleOAuthCallback(supabase, code);

        return res.redirect(targetOrigin);
    } catch (err) {
        console.error('Callback error:', err);
        return res.redirect(`${targetOrigin}/login?error=auth_failed`);
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
