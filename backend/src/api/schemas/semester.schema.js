import { z } from 'zod';

export const semesterBodySchema = z.object({
	term: z.string().trim().min(1).max(8),
	year: z.coerce.number().int().min(1900).max(3000),
});

export const semesterQuerySchema = semesterBodySchema;
