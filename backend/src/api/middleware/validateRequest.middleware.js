/*
Adi Avraham
CMSC495 Group Golf Capstone Project
validateRequest.middleware.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Validates request params, query strings, and bodies against Zod schemas before controllers run.
*/

// Middleware to validate incoming requests using Zod schemas to simplify validation logic across routes.
export function validateRequest(schema, source = 'body') {
	return (req, res, next) => {
		const result = schema.safeParse(req[source]);

		if (!result.success) {
			return res.status(400).json({
				error: 'Validation failed.',
				details: result.error.flatten(),
			});
		}

		Object.assign(req[source], result.data);
		next();
	};
}

export const validateBody = (schema) => validateRequest(schema, 'body');
export const validateParams = (schema) => validateRequest(schema, 'params');
export const validateQuery = (schema) => validateRequest(schema, 'query');
