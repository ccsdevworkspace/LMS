import { z } from 'zod';

export const createMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message cannot exceed 2000 characters'),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
