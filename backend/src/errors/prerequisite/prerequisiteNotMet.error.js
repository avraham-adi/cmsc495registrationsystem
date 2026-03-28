import EnrollmentError from '../enrollment/enrollment.error.js';

export default class PrerequisiteNotMetError extends EnrollmentError {
    constructor(courseId) {
        super(`Prerequisites not met for course ${courseId}`);
    }
}