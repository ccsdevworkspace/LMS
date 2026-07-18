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
            secure: env.isProduction,
        },
        cookies: {
            getAll() {
                return parseCookieHeader(req.headers.cookie ?? '');
            },
            setAll(cookiesToSet, headers) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    res.appendHeader(
                        'Set-Cookie',
                        serializeCookieHeader(name, value, options),
                    ),
                );
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) =>
                        res.setHeader(key, value),
                    );
                }
            },
        },
    });
}
