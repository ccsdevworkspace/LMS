import axios from 'axios';

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
const slug = branch
    .replace(/\//g, '')
    .toLowerCase();

if (branch && branch !== 'main') {
    import.meta.env.VITE_API_BASE_URL = `https://lms--${slug}.ccs-dev.deno.net`;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api