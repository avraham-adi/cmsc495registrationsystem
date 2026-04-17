/*
Adi Avraham
CMSC495 Group Golf Capstone Project
enrollment.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the shared base error type for enrollment-related failures.
*/

import AppError from '../base/app.error.js';

export default class EnrollmentError extends AppError {
	constructor(message = 'Enrollment operation failed.', details = null) {
		super(message, {
			code: 'ENROLLMENT_ERROR',
			status: 400,
			details,
		});
	}
}
