import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { liveClassRateLimiter } from '../../config/limiter.config.js';
import {
    getStatusHandler,
    createLiveClassHandler,
    endLiveClassHandler,
    getTokenHandler,
} from './live-class.controller.js';

const router = Router();

router.use(authenticate);
router.use(liveClassRateLimiter);

router.get('/courses/:id/live-class', getStatusHandler);
router.post('/courses/:id/live-class', createLiveClassHandler);
router.delete('/courses/:id/live-class', endLiveClassHandler);
router.get('/courses/:id/live-class/token', getTokenHandler);

export default router;
