import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({
    path: `.env.development.local`,
});
dotenv.config();

export default defineConfig({
    schema: 'prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: env('DIRECT_URL'),
    },
});
