/*
Adi Avraham
CMSC495 Group Golf Capstone Project
invalidCourseData.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when submitted course data is invalid.
*/

import ValidationError from '../validation/validation.error.js';

export default class InvalidCourseDataError extends ValidationError {
	constructor(details) {
		super('Invalid course data.', details);
	}
}
