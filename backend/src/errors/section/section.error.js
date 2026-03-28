import AppError from '../base/app.error.js';

export default class SectionError extends AppError {
    constructor(message) {
        super(message, { code: 'SECTION_ERROR' });
    }
}