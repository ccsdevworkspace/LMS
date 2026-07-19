import dotenv from 'dotenv';

dotenv.config({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`,
});

export const env = {
    port: Number(process.env.PORT) || 3000,
    baseUrl: process.env.BASE_URL!,
    allowedOrigin: process.env.ALLOWED_ORIGIN!,
    supabaseUrl: process.env.SUPABASE_URL!,
    supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY!,
    databaseUrl: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL!,
    isProduction: process.env.NODE_ENV === 'production',
};
