/*
Adi Avraham
CMSC495 Group Golf Capstone Project
duplicateEntry.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a unique resource or relationship already exists.
*/

import AppError from '../base/app.error.js';

export default class DuplicateEntryError extends AppError {
	constructor(resource = 'Resource', details = null) {
		const normalizedResource = String(resource).trim();
		const message = /already exists\.?$/i.test(normalizedResource) ? normalizedResource.replace(/\.*$/, '.') : normalizedResource + ' already exists.';

		super(message, {
			code: 'DUPLICATE_ENTRY',
			status: 409,
			details,
		});
	}
}
