import { Request, Response } from 'express';
import {
    createServerClient,
    parseCookieHeader,
    serializeCookieHeader,
} from '@supabase/ssr';
import { env } from './env.config.js';

export function createSupabaseClient(req: Request, res: Response) {
    return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
        cookieOptions: {
            httpOnly: true,
            secure: env.isProduction,
            sameSite: 'lax',
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
