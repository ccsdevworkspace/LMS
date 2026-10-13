import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
    getMessagesHandler,
    createMessageHandler,
    deleteMessageHandler,
} from './discussion.controller.js';

const router = Router();

router.use(authenticate);

router.get('/courses/:id/messages', getMessagesHandler);
router.post('/courses/:id/messages', createMessageHandler);
router.delete('/courses/:id/messages/:messageId', deleteMessageHandler);

export default router;
