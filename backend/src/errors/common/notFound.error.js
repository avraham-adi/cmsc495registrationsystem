import AppError from '../base/app.error.js';

export default class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, {
            code: 'NOT_FOUND',
            status: 404
        });
    }
}