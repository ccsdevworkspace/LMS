import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createTodo, deleteTodo, getTodos } from './todo.controller.js';

const router = Router();

router.use(authenticate);

router.post('/todos', createTodo);
router.delete('/todos/:id', deleteTodo);
router.get('/todos', getTodos);

export default router;
