import NotFoundError from '../common/notFound.error.js'

export default class CourseNotFoundError extends NotFoundError {
    constructor(courseCode) {
        super(`Course (${courseCode})`);
    }
}