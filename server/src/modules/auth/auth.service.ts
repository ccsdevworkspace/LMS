import type { createSupabaseClient } from '../../config/supabaseClient.js';
import { env } from '../../config/env.config.js';
import { saveUser } from './auth.repository.js';

type SupabaseClient = ReturnType<typeof createSupabaseClient>;

export async function initiateOAuth(
    supabase: SupabaseClient,
    returnTo?: string,
) {
    const redirectTo = returnTo
        ? `${env.baseUrl}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
        : `${env.baseUrl}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
        },
    });

    if (error) {
        throw error;
    }

    return data.url;
}

export async function handleOAuthCallback(
    supabase: SupabaseClient,
    code: string,
) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        throw new Error(error?.message || 'Failed to exchange code');
    }

    const { user } = data;
    const metadata = user.user_metadata ?? {};

    await saveUser({
        id: user.id,
        fullName: metadata.full_name ?? metadata.name ?? null,
        avatarUrl: metadata.avatar_url ?? metadata.picture ?? null,
    });
}
