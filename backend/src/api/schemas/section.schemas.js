import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const DAY_ORDER = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
const DAY_ORDER_INDEX = new Map(DAY_ORDER.map((day, index) => [day, index]));

function isCanonicalDaysValue(value) {
	const normalized = value.toUpperCase().trim();

	if (normalized.length === 0 || normalized.length > DAY_ORDER.length) {
		return false;
	}

	const seen = new Set();
	let previousIndex = -1;

	for (const day of normalized) {
		const index = DAY_ORDER_INDEX.get(day);

		if (index === undefined || seen.has(day) || index <= previousIndex) {
			return false;
		}

		seen.add(day);
		previousIndex = index;
	}

	return true;
}

function compareTimes(startTime, endTime) {
	return startTime.localeCompare(endTime);
}

// Validation schema for section-related operations
export const sectionBodySchema = z
	.object({
		semId: z.coerce.number().int().positive(),
		profId: z.coerce.number().int().positive(),
		capacity: z.coerce.number().int().positive(),
		days: z
			.string()
			.trim()
			.toUpperCase()
			.refine(isCanonicalDaysValue, 'Days must use unique canonical day codes in order, such as MWF or TR.')
			.optional(),
		startTm: z.string().regex(TIME_PATTERN, 'Start time must be in HH:MM:SS 24-hour format.').optional(),
		endTm: z.string().regex(TIME_PATTERN, 'End time must be in HH:MM:SS 24-hour format.').optional(),
	})
	.superRefine((value, ctx) => {
		const hasStartTime = Boolean(value.startTm);
		const hasEndTime = Boolean(value.endTm);

		if (hasStartTime !== hasEndTime) {
			ctx.addIssue({
				code: 'custom',
				message: 'Start time and end time must both be provided together.',
				path: hasStartTime ? ['endTm'] : ['startTm'],
			});
		}

		if (hasStartTime && hasEndTime && compareTimes(value.startTm, value.endTm) >= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Start time must be earlier than end time.',
				path: ['startTm'],
			});
		}
	});

export const sectionQuerySchema = z
	.object({
		semId: z.coerce.number().int().positive(),
		profId: z.coerce.number().int().positive(),
		capacity: z.coerce.number().int().positive(),
		days: z
			.string()
			.trim()
			.toUpperCase()
			.refine(isCanonicalDaysValue, 'Days must use unique canonical day codes in order, such as MWF or TR.')
			.optional(),
		startTm: z.string().regex(TIME_PATTERN, 'Start time must be in HH:MM:SS 24-hour format.').optional(),
		endTm: z.string().regex(TIME_PATTERN, 'End time must be in HH:MM:SS 24-hour format.').optional(),
	})
	.superRefine((value, ctx) => {
		const hasStartTime = Boolean(value.startTm);
		const hasEndTime = Boolean(value.endTm);

		if (hasStartTime !== hasEndTime) {
			ctx.addIssue({
				code: 'custom',
				message: 'Start time and end time must both be provided together.',
				path: hasStartTime ? ['endTm'] : ['startTm'],
			});
		}

		if (hasStartTime && hasEndTime && compareTimes(value.startTm, value.endTm) >= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Start time must be earlier than end time.',
				path: ['startTm'],
			});
		}
	});

// Validation schema for listing sections
export const getAllSectionsQuerySchema = paginationQuerySchema.extend({
	crsId: z.coerce.number().int().positive().optional(),
	semId: z.coerce.number().int().positive().optional(),
	profId: z.coerce.number().int().positive().optional(),
});

export const generateAccessCodesBodySchema = z.object({
	numCodes: z.coerce.number().int().positive().max(25),
});

export const revokeAccessCodesBodySchema = z.object({
	codesToRevoke: z.array(z.string().trim().min(1)).min(1),
});

export const revokeAccessCodesQuerySchema = z.object({
	codes: z.string().trim().min(1),
});
