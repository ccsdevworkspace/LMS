import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getProfile } from './user.controller.js';

const router = Router();

router.get('/profile', authenticate, getProfile);

export default router;
