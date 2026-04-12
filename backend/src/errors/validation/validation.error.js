/*
Adi Avraham
CMSC495 Group Golf Capstone Project
validation.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the validation error type used for invalid request and business-rule inputs.
*/

import AppError from '../base/app.error.js';

export default class ValidationError extends AppError {
    constructor(message = 'Invalid input.', details = null) {
        super(message, {
            code: 'VALIDATION_ERROR',
            status: 400,
            details,
        });
    }
}
