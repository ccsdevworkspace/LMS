import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimiter from './config/limiter.config.js';
import corsConfig from './config/cors.config.js';
import getterRoute from './routes/getter.route.js';
import authRoute from './modules/auth/auth.routes.js';
import userRoute from './modules/user/user.routes.js';
import { env } from './config/env.config.js';

const server = express();
const PORT = env.port || 3000;

server.use(rateLimiter);
server.use(corsConfig);
server.use(helmet());
server.use(cookieParser());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/', getterRoute);
server.use('/auth', authRoute);
server.use('/user', userRoute);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
