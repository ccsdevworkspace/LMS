import type { createSupabaseClient } from '../../config/supabaseClient.js';
import { saveUser } from './auth.repository.js';

type SupabaseClient = ReturnType<typeof createSupabaseClient>;

export async function initiateOAuth(supabase: SupabaseClient, baseUrl: string) {
    // Do NOT embed returnTo in the redirectTo URL — Supabase validates the
    // redirectTo against the allowlist and query params can cause a mismatch.
    // The returnTo is already persisted in the oauth_return_to cookie, so the
    // callback handler will pick it up from there.
    const redirectTo = `${baseUrl}/auth/callback`;

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
