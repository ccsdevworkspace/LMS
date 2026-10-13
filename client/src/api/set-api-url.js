import fs from 'fs';

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
const slug = branch.replace(/\//g, '').toLowerCase().slice(0, 25);

const apiUrl = (branch && branch !== 'main')
    ? `https://lms--${slug}.ccs-dev.deno.net`
    : process.env.VITE_API_BASE_URL_PROD;

if (apiUrl) {
    fs.writeFileSync('.env.local', `VITE_API_BASE_URL=${apiUrl}\n`);
    console.log(`[set-api-url] branch="${branch}" -> ${apiUrl}`);
} else {
    if (fs.existsSync('.env.local')) {
        fs.unlinkSync('.env.local');
    }
    console.log(`[set-api-url] branch="${branch}" (no remote API URL set, skipping .env.local)`);
}