import { z } from 'zod';
import { Request, Response } from 'express';
import { create, remove, getAll } from './todo.repository.js';

const createTodoSchema = z.object({
    title: z.string().trim().min(1).max(200),
});

async function createTodo(req: Request, res: Response) {
    const { title } = createTodoSchema.parse(req.body);
    const todo = await create(req.user.id, title);
    res.status(201).json({ todo });
}

async function deleteTodo(req: Request, res: Response) {
    const deleted = await remove(req.params.id, req.user.id);

    if (!deleted) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted' });
}

async function getTodos(req: Request, res: Response) {
    const todos = await getAll(req.user.id);
    res.json({ todos });
}

export { createTodo, deleteTodo, getTodos };
