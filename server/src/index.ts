import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimiter from './config/limiter.config.js';
import corsConfig from './config/cors.config.js';
import getterRoute from './routes/getter.route.js';

const server = express();
const PORT = process.env.PORT || 3000;

server.use(rateLimiter);
server.use(corsConfig);
server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/', getterRoute);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
