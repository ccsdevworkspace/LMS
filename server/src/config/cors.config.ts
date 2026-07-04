import cors from 'cors';

export default cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', // Common Port for Vite or React
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204,
});
