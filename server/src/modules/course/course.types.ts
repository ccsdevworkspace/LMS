import { z } from 'zod';

export const joinCourseSchema = z.object({
    code: z.string().length(6, 'Join code must be exactly 6 characters'),
});

const time = z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format');

export const createCourseSchema = z
    .object({
        name: z.string().min(1, 'Course name is required'),
        section: z.string(),
        days: z
            .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))
            .min(1, 'Select a day'),
        startTime: time,
        endTime: time,
    })
    .refine(({ startTime, endTime }) => startTime < endTime, {
        message: 'End time should be later from the start time',
        path: ['endTime'],
    });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z
    .object({
        name: z.string().min(1, 'Course name is required').optional(),
        section: z.string().optional(),
        days: z
            .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']))
            .min(1, 'Select a day')
            .optional(),
        startTime: time.optional(),
        endTime: time.optional(),
    })
    .refine(
        ({ startTime, endTime }) =>
            !startTime || !endTime || startTime < endTime,
        {
            message: 'End time should be later from the start time',
            path: ['endTime'],
        },
    );

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
