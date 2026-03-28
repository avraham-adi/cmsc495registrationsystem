import AppError from '../base/app.error.js';

export default class DuplicateEntryError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} already exists`, {
            code: 'DUPLICATE_ENTRY',
            status: 409
        });
    }
}