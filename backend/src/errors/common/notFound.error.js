/*
Adi Avraham
CMSC495 Group Golf Capstone Project
notFound.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the generic not-found error type for missing resources.
*/

import AppError from '../base/app.error.js';

export default class NotFoundError extends AppError {
    constructor(resource = 'Resource', details = null) {
        const normalizedResource = String(resource).trim();
        const message = /not found\.?$/i.test(normalizedResource) ? normalizedResource.replace(/\.*$/, '.') : normalizedResource + ' not found.';

        super(message, {
            code: 'NOT_FOUND',
            status: 404,
            details,
        });
    }
}
