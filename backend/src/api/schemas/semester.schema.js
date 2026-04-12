/*
Adi Avraham
CMSC495 Group Golf Capstone Project
semester.schema.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines request validation schemas for semester reads and mutations.
*/

import { z } from 'zod';

export const semesterBodySchema = z.object({
	term: z.string().trim().min(1).max(8),
	year: z.coerce.number().int().min(1900).max(3000),
});

export const semesterQuerySchema = semesterBodySchema;
