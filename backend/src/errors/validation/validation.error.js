import AppError from '../base/app.error.js'

export default class ValidationError extends AppError {
    constructor(message = 'Invalid input', details = null) {
        super(message, {
            code: 'VALIDATION_ERROR',
            status: 400,
            details
        });
    }
}