import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../config/limiter.config.js';
import {
    handleOAuth,
    handleCallback,
    getMe,
    handleLogout,
} from './auth.controller.js';

const router = Router();

router.get('/oauth', authRateLimiter, handleOAuth);
router.get('/callback', authRateLimiter, handleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, handleLogout);

export default router;
