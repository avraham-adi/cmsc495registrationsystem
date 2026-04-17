/*
Adi Avraham
CMSC495 Group Golf Capstone Project
database.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the base database error type for persistence-layer failures.
*/

import AppError from '../base/app.error.js';

export default class DatabaseError extends AppError {
	constructor(message = 'Database operation failed.', details = null) {
		super(message, {
			code: 'DATABASE_ERROR',
			status: 500,
			details,
		});
	}
}
