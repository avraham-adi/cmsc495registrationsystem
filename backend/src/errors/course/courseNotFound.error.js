/*
Adi Avraham
CMSC495 Group Golf Capstone Project
courseNotFound.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a requested course cannot be found.
*/

import NotFoundError from '../common/notFound.error.js';

export default class CourseNotFoundError extends NotFoundError {
	constructor(courseIdentifier = null, details = null) {
		if (typeof courseIdentifier === 'string' && /not found/i.test(courseIdentifier)) {
			super(courseIdentifier, details);
			return;
		}

		const resource = courseIdentifier ? 'Course (' + courseIdentifier + ')' : 'Course';
		super(resource, details);
	}
}
