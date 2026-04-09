import EnrollmentError from './enrollment.error.js';

export default class ScheduleConflictError extends EnrollmentError {
    constructor(details = null) {
        super('Schedule conflict with an existing enrollment.', details);
        this.code = 'SCHEDULE_CONFLICT';
        this.status = 409;
        this.statusCode = 409;
    }
}
