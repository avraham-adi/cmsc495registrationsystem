/*
Adi Avraham
CMSC495 Group Golf Capstone Project
scheduleConflict.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when an enrollment conflicts with the student's schedule.
*/

import EnrollmentError from './enrollment.error.js';

export default class ScheduleConflictError extends EnrollmentError {
    constructor(details = null) {
        super('Schedule conflict with an existing enrollment.', details);
        this.code = 'SCHEDULE_CONFLICT';
        this.status = 409;
        this.statusCode = 409;
    }
}
