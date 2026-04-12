/*
Adi Avraham
CMSC495 Group Golf Capstone Project
enrollment.schema.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines request validation schemas for enrollment creation and updates.
*/

import { z } from 'zod';

export const enrollmentCreateBodySchema = z.object({
	stuId: z.coerce.number().int().positive(),
	secId: z.coerce.number().int().positive(),
});

export const enrollmentListQuerySchema = z.object({
	stuId: z.coerce.number().int().positive(),
});

export const enrollmentUpdateBodySchema = z
	.object({
		status: z.enum(['enrolled', 'dropped', 'completed', 'waitlisted']),
		code: z.string().trim().min(1).optional(),
	})
	.superRefine((value, ctx) => {
		if (value.status === 'enrolled' && !value.code) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Access code is required when moving from waitlisted to enrolled.',
				path: ['code'],
			});
		}
	});
