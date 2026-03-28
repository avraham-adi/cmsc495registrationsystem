import EnrollmentError from './enrollment.error.js'

export default class AlreadyEnrolledError extends EnrollmentError {
    constructor(studentId, courseId) {
        super(`Student ${studentId} already enrolled in course ${courseId}`);
    }
}
