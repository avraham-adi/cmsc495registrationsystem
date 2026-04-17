/*
Adi Avraham
CMSC495 Group Golf Capstone Project
authorization.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the authorization error type for forbidden actions.
*/

import AppError from '../base/app.error.js';

export default class AuthorizationError extends AppError {
	constructor(message = 'Unauthorized access.', details = null) {
		super(message, {
			code: 'AUTHORIZATION_ERROR',
			status: 403,
			details,
		});
	}
}
