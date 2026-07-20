import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
    handleOAuth,
    handleCallback,
    getMe,
    handleLogout,
} from './auth.controller.js';

const router = Router();

router.get('/oauth', handleOAuth);
router.get('/callback', handleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, handleLogout);

export default router;
