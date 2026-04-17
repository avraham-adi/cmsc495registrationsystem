/*
Adi Avraham
CMSC495 Group Golf Capstone Project
app.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the common application error base class used by backend error types.
*/

export default class AppError extends Error {
	constructor(message = 'Application error.', options = {}) {
		super(message);

		this.name = this.constructor.name;
		this.code = options.code ?? 'APP_ERROR';
		this.status = options.status ?? 500;
		this.statusCode = this.status;
		this.details = options.details ?? null;
		this.isOperational = options.isOperational ?? true;

		Error.captureStackTrace?.(this, this.constructor);
	}

	toJSON() {
		return {
			error: this.message,
			code: this.code,
			details: this.details,
		};
	}
}
