/*
Adi Avraham
CMSC495 Group Golf Capstone Project
sectionFull.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a section has no remaining enrolled capacity.
*/

import SectionError from './section.error.js';

export default class SectionFullError extends SectionError {
	constructor(sectionId) {
		super('Section ' + sectionId + ' is full.', { sectionId });
		this.code = 'SECTION_FULL';
		this.status = 409;
		this.statusCode = 409;
	}
}
