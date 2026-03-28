import AppError from '../base/app.error.js';

export default class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', details = null) {
        super(message, {
            code: 'DATABASE_ERROR',
            status: 500,
            details
        });
    }
}