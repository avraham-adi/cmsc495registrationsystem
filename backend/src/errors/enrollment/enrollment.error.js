import AppError from '../base/app.error.js';

export default class EnrollmentError extends AppError {
    constructor(message) {
        super(message, { code: 'ENROLLMENT_ERROR' });
    }
}