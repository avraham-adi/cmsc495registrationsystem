/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisiteRelationshipNotFound.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a prerequisite relationship cannot be found for removal.
*/

import NotFoundError from '../common/notFound.error.js';

export default class PrerequisiteRelationshipNotFoundError extends NotFoundError {
	constructor(courseId, prerequisiteId, details = null) {
		super('Prerequisite relationship', {
			courseId,
			prerequisiteId,
			...(details ?? {}),
		});
	}
}
