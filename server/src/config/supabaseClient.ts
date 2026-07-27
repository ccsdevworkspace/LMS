import { Request, Response } from 'express';
import {
    createServerClient,
    parseCookieHeader,
    serializeCookieHeader,
} from '@supabase/ssr';
import { env } from './env.config.js';

export function createSupabaseClient(req: Request, res: Response) {
    const crossSite = process.env.CROSS_SITE === 'true';
    const sameSite = crossSite ? 'none' : 'lax';
    const secure = crossSite || env.isProduction;

    return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
        cookieOptions: {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
        },
        cookies: {
            getAll() {
                return parseCookieHeader(req.headers.cookie ?? '');
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    res.appendHeader(
                        'Set-Cookie',
                        serializeCookieHeader(name, value, options),
                    ),
                );
            },
        },
    });
}
