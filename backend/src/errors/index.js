export { default as AppError } from './base/app.error.js';

export { default as AuthenticationError } from './auth/authentication.error.js';
export { default as AuthorizationError } from './auth/authorization.error.js';

export { default as DatabaseError } from './database/database.error.js';

export { default as ValidationError } from './validation/validation.error.js';

export { default as NotFoundError } from './common/notFound.error.js';
export { default as DuplicateEntryError } from './common/duplicateEntry.error.js';
export { default as InvalidSelectionError } from './common/invalidSelection.error.js';

export { default as CourseError } from './course/course.error.js';
export { default as CourseNotFoundError } from './course/courseNotFound.error.js';
export { default as InvalidCourseDataError } from './course/invalidCourseData.error.js';

export { default as EnrollmentError } from './enrollment/enrollment.error.js';
export { default as AlreadyEnrolledError } from './enrollment/alreadyEnrolled.error.js';

export { default as SectionError } from './section/section.error.js';
export { default as SectionFullError } from './section/sectionFull.error.js';

export { default as PrerequisiteNotMetError } from './prerequisite/prerequisiteNotMet.error.js';