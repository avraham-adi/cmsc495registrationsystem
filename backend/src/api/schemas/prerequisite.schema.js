/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisite.schema.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines request validation schemas for prerequisite reads and mutations.
*/

import { z } from 'zod';

export const prerequisiteBodySchema = z.object({
	cId: z.coerce.number().int().positive(),
	pId: z.coerce.number().int().positive(),
});
