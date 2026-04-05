import { z } from 'zod';

export const enrollmentCreateBodySchema = z.object({
	stuId: z.coerce.number().int().positive(),
	secId: z.coerce.number().int().positive(),
	code: z.string().trim().min(1),
});

export const enrollmentUpdateBodySchema = z.object({
	status: z.enum(['enrolled', 'dropped', 'completed', 'waitlisted']),
	code: z.string().trim().min(1),
});
