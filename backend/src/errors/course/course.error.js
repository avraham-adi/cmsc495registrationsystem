import AppError from '../base/app.error.js'

export default class CourseError extends AppError {
    constructor(message) {
        super(message, { code: 'COURSE_ERROR' });
    }
}