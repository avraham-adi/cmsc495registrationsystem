/*
Adi Avraham
CMSC495 Group Golf Capstone Project
course.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the shared base error type for course-related failures.
*/

import AppError from '../base/app.error.js';

export default class CourseError extends AppError {
	constructor(message = 'Course operation failed.', details = null) {
		super(message, {
			code: 'COURSE_ERROR',
			status: 400,
			details,
		});
	}
}
