import { z } from 'zod';

// Validation schema for user login
export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

// Validation schema for changing password
export const changePasswordSchema = z.object({
	password: z.string().trim().min(1),
});

// Validation schema for updating user information
export const updateUserSchema = z.object({
	name: z.string().trim().min(1).max(45),
	email: z.email(),
});
