import axios from 'axios';

const branch = process.env.VERCEL_GIT_COMMIT_REF || '';
const slug = branch
    .replace(/\//g, '')
    .toLowerCase();

if (branch && branch !== 'main') {
    process.env.VITE_API_BASE_URL = `https://lms--${slug}.ccs-dev.deno.net`;
}

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
