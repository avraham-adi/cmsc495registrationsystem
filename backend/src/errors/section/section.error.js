/*
Adi Avraham
CMSC495 Group Golf Capstone Project
section.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the shared base error type for section-related failures.
*/

import AppError from '../base/app.error.js';

export default class SectionError extends AppError {
    constructor(message = 'Section operation failed.', details = null) {
        super(message, {
            code: 'SECTION_ERROR',
            status: 400,
            details,
        });
    }
}
