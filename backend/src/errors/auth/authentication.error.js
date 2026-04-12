/*
Adi Avraham
CMSC495 Group Golf Capstone Project
authentication.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the authentication error type for missing or invalid credentials.
*/

import AppError from '../base/app.error.js';

export default class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed.', details = null) {
        super(message, {
            code: 'AUTHENTICATION_ERROR',
            status: 401,
            details,
        });
    }
}
