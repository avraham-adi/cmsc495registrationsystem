/*
Adi Avraham
CMSC495 Group Golf Capstone Project
api.ts
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the shared frontend TypeScript types for API payloads, entities, and responses.
*/

// Possible User Roles
export type UserRole = 'ADMIN' | 'PROFESSOR' | 'STUDENT';

// User Object
export type User = {
	id: number;
	name: string;
	email: string;
	first_login: boolean;
	role: UserRole;
	role_id: number;
	role_details: string;
};

// Login Response Object
export type LoginResponse = {
	message: string;
	firstLogin: boolean;
	User: User;
};

// AuthUser Response
export type AuthUserResponse = {
	User: User;
};

// API Error Payload
export type ApiErrorPayload = {
	error?: string;
	message?: string;
	code?: string;
	details?: unknown;
};

// Metadata Object
export type Meta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

// User List Response
export type UserListResponse = {
	User: Array<{ User: User }>;
	Meta: Meta;
};

export type Prerequisite = {
	courseId: number;
	courseCode: string;
	title: string;
};

export type PrerequisiteListResponse = Array<{ Prerequisite: Prerequisite }>;

// Semester Object
export type Semester = {
	semester_id: number;
	term: string;
	year: number;
};

// Semester List Response
export type SemesterListResponse = Array<{ Semester: Semester }>;

// Course Object
export type Course = {
	course_id: number;
	course_code: string;
	title: string;
	description: string;
	credits: number;
	subject: string;
};

// Course List Response
export type CourseListResponse = {
	Course: Array<{ Course: Course }>;
	Meta: Meta;
};

export type CourseCreatePayload = {
	code: string;
	title: string;
	desc: string;
	cred: number;
};

// Section Object
export type Section = {
	section_id: number;
	capacity: number;
	enrolled_count: number;
	waitlisted_count: number;
	seats_available: number;
	days: string;
	start_time: string | null;
	end_time: string | null;
	course: {
		course_id: number;
		course_code: string;
		title: string;
		description: string;
		subject: string;
		credits: number;
	};
	professor: {
		professor_id: number;
		professor_name: string;
	};
	semester: {
		semester_id: number;
		term: string;
		year: number;
	};
};

// Section List Response
export type SectionListResponse = {
	Section: Array<{ Section: Section }>;
	Meta: Meta;
};

export type SectionCreatePayload = {
	semId: number;
	profId: number;
	capacity: number;
	days?: string;
	startTm?: string;
	endTm?: string;
};

export type SectionUpdatePayload = SectionCreatePayload;

export type SectionAccessCodeMap = Record<string, string | boolean>;

// Enrollment Object
export type Enrollment = {
	enrollment_id: number;
	student_id: number;
	section_id: number;
	status: EnrollmentStatus;
};

// Enrollment status options
export type EnrollmentStatus = 'enrolled' | 'waitlisted' | 'dropped' | 'completed';

// Enrollment List Response
export type EnrollmentListResponse = Array<{ Enrollment: Enrollment }>;

// Enrollment Create Payload
export type EnrollmentCreatePayload = {
	secId: number;
	stuId: number;
};

// Enrollment Update Payload
export type EnrollmentUpdatePayload = {
	status: EnrollmentStatus;
	code?: string;
};

// User Update Payload
export type UpdateUserPayload = {
	name: string;
	email: string;
};

// Password Change Payload
export type ChangePasswordPayload = {
	password: string;
};

// Login Payload
export type LoginPayload = {
	email: string;
	password: string;
};

// Admin Create User Payload
export type AdminUserCreatePayload = {
	name: string;
	email: string;
	detail: string;
	type: UserRole;
};

// Admin Role Update Payload
export type AdminUserRoleUpdatePayload = {
	detail: string;
	type: UserRole;
};
