import { z } from 'zod';

// Validation schema for common parameters and query options used across multiple endpoints
export const idParamSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const cIdParamSchema = z.object({
	cId: z.coerce.number().int().positive(),
});

export const prereqParamSchema = z.object({
	cId: z.coerce.number().int().positive(),
	pId: z.coerce.number().int().positive(),
});

// Validation schema for pagination and search query parameters, with defaults for page and limit, and optional search string
export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(10),
	search: z.string().trim().default(''),
});
