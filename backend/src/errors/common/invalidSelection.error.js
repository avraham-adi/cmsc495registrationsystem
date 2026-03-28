import ValidationError from '../validation/validation.error.js';

export default class InvalidSelectionError extends ValidationError {
    constructor(selection) {
        super(`Invalid menu selection: ${selection}`);
    }
}