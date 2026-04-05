import { z } from 'zod';

export const prerequisiteBodySchema = z.object({
	cId: z.coerce.number().int().positive(),
	pId: z.coerce.number().int().positive(),
});
