import ValidationError from '../validation/validation.error.js';

export default class InvalidCourseDataError extends ValidationError {
    constructor(details) {
        super('Invalid course data', details);
    }
}