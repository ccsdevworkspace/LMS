import fs from 'fs';

const branch = import.meta.env.VERCEL_GIT_COMMIT_REF || '';
const slug = branch.replace(/\//g, '').toLowerCase();

const apiUrl = (branch && branch !== 'main')
    ? `https://lms--${slug}.ccs-dev.deno.net`
    : import.meta.env.VITE_API_BASE_URL_PROD;

fs.writeFileSync('.env.local', `VITE_API_BASE_URL=${apiUrl}\n`);
console.log(`[set-api-url] branch="${branch}" -> ${apiUrl}`);