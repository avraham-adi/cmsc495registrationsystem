import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';
import { COURSE_SUBJECTS } from '../../utils/courseSubjects.js';

// Validation schema for course code, ensuring it follows the format of 4 uppercase letters followed by 3 digits (e.g., ABCD123)
const courseCodeSchema = z
    .string()
    .trim()
    .regex(/^[A-Z]{4}\d{3}[A-Z]?$/, 'Course code must be in format ABCD123 or ABCD123A');

// Validation schema for course-related operations
export const courseBodySchema = z.object({
    code: courseCodeSchema,
    title: z.string().trim().min(1).max(100),
    desc: z.string().trim().min(1),
    cred: z.coerce.number().int().positive(),
});

export const getAllCoursesQuerySchema = paginationQuerySchema.extend({
    subject: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{4}$/, 'Subject must be a 4-letter code.')
        .refine((value) => Object.hasOwn(COURSE_SUBJECTS, value), 'Invalid subject filter.')
        .optional(),
});
