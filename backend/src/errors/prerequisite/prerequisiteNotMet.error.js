/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisiteNotMet.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a student has not met required prerequisites.
*/

import EnrollmentError from '../enrollment/enrollment.error.js';

export default class PrerequisiteNotMetError extends EnrollmentError {
	constructor(courseId, missingPrerequisites = []) {
		super('Prerequisites not met for course ' + courseId + '.', {
			courseId,
			missingPrerequisites,
		});
		this.code = 'PREREQUISITE_NOT_MET';
		this.status = 409;
		this.statusCode = 409;
	}
}
