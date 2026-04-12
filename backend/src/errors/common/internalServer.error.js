/*
Adi Avraham
CMSC495 Group Golf Capstone Project
internalServer.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the generic internal server error type for unexpected backend failures.
*/

import AppError from '../base/app.error.js';

export default class InternalServerError extends AppError {
    constructor(message = 'Internal server error.', details = null) {
        super(message, {
            code: 'INTERNAL_SERVER_ERROR',
            status: 500,
            details,
        });
    }
}
