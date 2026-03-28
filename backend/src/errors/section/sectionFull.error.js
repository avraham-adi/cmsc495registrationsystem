import SectionError from './section.error.js'

export default class SectionFullError extends SectionError {
    constructor(sectionId) {
        super(`Section ${sectionId} is full`);
    }
}