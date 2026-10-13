import cors from 'cors';
export const allowedOrigins = [
    'http://localhost:5173',
    process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];

export const vercelPreviewPattern =
    /^https:\/\/lms(-git-[a-z0-9-]+|-[a-z0-9]+)?-ccsdevworkspaces-projects\.vercel\.app$/;

export function isAllowedOrigin(origin?: string): boolean {
    if (!origin) return false;
    return allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin);
}

export default cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
});
