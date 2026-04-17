/*
Adi Avraham
CMSC495 Group Golf Capstone Project
admin.schemas.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines request validation schemas for admin-managed user operations.
*/

import { z } from 'zod';
import { paginationQuerySchema } from './common.schema.js';

// Validation schema for setting user role, using discriminated union to handle different role details based on user type
const adminRoleSchema = z.object({
	type: z.literal('ADMIN'),
	detail: z.string().trim().min(1),
});

const professorRoleSchema = z.object({
	type: z.literal('PROFESSOR'),
	detail: z.string().trim().min(1),
});

const studentRoleSchema = z.object({
	type: z.literal('STUDENT'),
	detail: z.string().trim().min(1),
});

export const setUserRoleSchema = z.discriminatedUnion('type', [adminRoleSchema, professorRoleSchema, studentRoleSchema]);

const addUserBaseSchema = z.object({
	name: z.string().trim().min(1).max(45),
	email: z.email(),
});

// Formatting validation schemas for adding a user
export const addUserSchema = z.discriminatedUnion('type', [
	addUserBaseSchema.extend(adminRoleSchema.shape),
	addUserBaseSchema.extend(professorRoleSchema.shape),
	addUserBaseSchema.extend(studentRoleSchema.shape),
]);

export const addUserQuerySchema = z.discriminatedUnion('type', [
	z.object({
		name: z.string().trim().min(1).max(45),
		email: z.email(),
		type: z.literal('ADMIN'),
		detail: z.string().trim().min(1),
	}),
	z.object({
		name: z.string().trim().min(1).max(45),
		email: z.email(),
		type: z.literal('PROFESSOR'),
		detail: z.string().trim().min(1),
	}),
	z.object({
		name: z.string().trim().min(1).max(45),
		email: z.email(),
		type: z.literal('STUDENT'),
		detail: z.string().trim().min(1),
	}),
]);

export const setUserRoleQuerySchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('ADMIN'),
		detail: z.string().trim().min(1),
	}),
	z.object({
		type: z.literal('PROFESSOR'),
		detail: z.string().trim().min(1),
	}),
	z.object({
		type: z.literal('STUDENT'),
		detail: z.string().trim().min(1),
	}),
]);

// Validation schema for getting all users with optional role filter and pagination
export const getAllUsersQuerySchema = paginationQuerySchema.extend({
	role: z.enum(['ADMIN', 'PROFESSOR', 'STUDENT']).optional(),
});
