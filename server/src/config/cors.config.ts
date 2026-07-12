import cors from 'cors';

const allowedOrigins = [
    'http://localhost:5173',
    process.env.ALLOWED_ORIGIN,
].filter(Boolean) as string[];
 
const vercelPreviewPattern = /^https:\/\/lms-git-[a-z0-9-]+-ccsdevworkspaces-projects\.vercel\.app$/;

export default cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
});
