/*
Adi Avraham
CMSC495 Group Golf Capstone Project
duplicatePrerequisite.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a prerequisite relationship already exists.
*/

import AppError from '../base/app.error.js';

export default class DuplicatePrerequisiteError extends AppError {
    constructor(courseId, prerequisiteId, details = null) {
        super('This prerequisite relationship already exists.', {
            code: 'DUPLICATE_PREREQUISITE',
            status: 409,
            details: {
                courseId,
                prerequisiteId,
                ...(details ?? {}),
            },
        });
    }
}
