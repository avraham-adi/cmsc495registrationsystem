/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisite.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the shared base error type for prerequisite-related failures.
*/

import AppError from '../base/app.error.js';

export default class PrerequisiteError extends AppError {
    constructor(message = 'Prerequisite operation failed.', details = null) {
        super(message, {
            code: 'PREREQUISITE_ERROR',
            status: 400,
            details,
        });
    }
}
