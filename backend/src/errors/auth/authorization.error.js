import AppError from '../base/app.error.js'

export default class AuthorizationError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, {
            code: 'AUTHORIZATION_ERROR',
            status: 403
        });
    }
}