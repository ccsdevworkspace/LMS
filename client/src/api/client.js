import axios from 'axios';

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
const slug = branch
    .replace(/\//g, '')
    .toLowerCase()
    .slice(0, 25);

if (branch && branch !== 'main') {
    import.meta.env.VITE_API_BASE_URL = `https://lms--${slug}.ccs-dev.deno.net`;
}

const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = (rawApiUrl && rawApiUrl !== 'undefined') ? rawApiUrl : 'http://localhost:3000';

const api = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api