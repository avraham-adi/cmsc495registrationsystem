/*
Adi Avraham
CMSC495 Group Golf Capstone Project
alreadyEnrolled.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a student is already enrolled in a section.
*/

import EnrollmentError from './enrollment.error.js';

export default class AlreadyEnrolledError extends EnrollmentError {
	constructor(studentId, courseId) {
		super('Student ' + studentId + ' is already enrolled in course ' + courseId + '.', {
			studentId,
			courseId,
		});
		this.code = 'ALREADY_ENROLLED';
		this.status = 409;
		this.statusCode = 409;
	}
}
