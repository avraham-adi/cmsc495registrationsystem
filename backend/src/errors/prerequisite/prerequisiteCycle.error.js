/*
Adi Avraham
CMSC495 Group Golf Capstone Project
prerequisiteCycle.error.js
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the error raised when a prerequisite change would create a cycle.
*/

import PrerequisiteError from './prerequisite.error.js';

export default class PrerequisiteCycleError extends PrerequisiteError {
    constructor(courseId, prerequisiteId) {
        super('This prerequisite relationship would create a cycle.', {
            courseId,
            prerequisiteId,
        });
        this.code = 'PREREQUISITE_CYCLE';
        this.status = 409;
        this.statusCode = 409;
    }
}
