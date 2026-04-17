/*
Adi Avraham
CMSC495 Group Golf Capstone Project
invalidSelection.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a selected option or enum value is invalid.
*/

import ValidationError from '../validation/validation.error.js';

export default class InvalidSelectionError extends ValidationError {
	constructor(selection = 'unknown') {
		super('Invalid menu selection: ' + selection + '.');
	}
}
