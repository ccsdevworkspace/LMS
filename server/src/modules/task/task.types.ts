import { z } from 'zod';

export const createTaskSchema = z.object({
    type: z.enum(['ASSIGNMENT', 'ACTIVITY']),
    title: z.string().min(1, 'Title is required'),
    totalPoints: z.coerce.number().int().nonnegative().optional(),
    instructions: z.string().optional(),
    deadline: z.string().optional(),
    publish: z.boolean().optional().default(false),
});

export const updateTaskSchema = z.object({
    title: z.string().optional(),
    totalPoints: z.coerce.number().int().nonnegative().optional(),
    instructions: z.string().optional(),
    deadline: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type CreateTaskInput = {
    courseId: string;
    createdById: string;
    type: 'ASSIGNMENT' | 'ACTIVITY';
    title: string;
    totalPoints?: number;
    instructions?: string;
    attachments: string[];
    deadline: Date | null;
    status: 'DRAFT' | 'PUBLISHED';
};

export const gradeSubmissionSchema = z.object({
    score: z.coerce.number().int().min(0).optional(),
    feedback: z.string().optional(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type NewTaskInput = z.infer<typeof createTaskSchema>;
