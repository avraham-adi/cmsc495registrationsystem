/*
Adi Avraham
CMSC495 Group Golf Capstone Project
admin.ts
input
admin filters, CRUD payloads, and route identifiers
output
typed API requests for admin user, course, prerequisite, semester, and section tools
description
Wraps admin-only HTTP requests behind typed helper functions used by the admin console.
*/

import { request } from './client';
import type {
	AdminUserCreatePayload,
	AdminUserRoleUpdatePayload,
	Course,
	CourseCreatePayload,
	CourseListResponse,
	Prerequisite,
	PrerequisiteListResponse,
	Section,
	SectionCreatePayload,
	SectionListResponse,
	SectionUpdatePayload,
	Semester,
	SemesterListResponse,
	User,
	UserListResponse,
	UserRole,
} from '../types/api';

type UserListQuery = {
	page?: number;
	limit?: number;
	search?: string;
	role?: UserRole | '';
};

// Requests paginated users with optional search and role filtering.
export function listUsers(query: UserListQuery = {}) {
	const params = new URLSearchParams();

	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.search) params.set('search', query.search);
	if (query.role) params.set('role', query.role);

	const suffix = params.toString();
	return request<UserListResponse>(`/admin${suffix ? `?${suffix}` : ''}`);
}

// Creates a user in the selected role table and users table.
export function createUser(payload: AdminUserCreatePayload) {
	return request<User>('/admin', {
		method: 'POST',
		body: payload,
	});
}

// Updates the selected user's role and role-specific detail field.
export function updateUserRole(id: number, payload: AdminUserRoleUpdatePayload) {
	return request<User>(`/admin/${id}/role`, {
		method: 'PUT',
		body: payload,
	});
}

// Deletes a user account through the admin API.
export function deleteUser(id: number) {
	return request<void>(`/admin/${id}`, {
		method: 'DELETE',
	});
}

type CourseListQuery = {
	page?: number;
	limit?: number;
	search?: string;
	subject?: string;
};

type SectionListQuery = {
	page?: number;
	limit?: number;
	search?: string;
	crsId?: number;
	semId?: number;
	profId?: number;
	subject?: string;
	days?: string;
};

// Requests paginated courses with optional search and subject filters.
export function listCourses(query: CourseListQuery = {}) {
	const params = new URLSearchParams();

	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.search) params.set('search', query.search);
	if (query.subject) params.set('subject', query.subject);

	const suffix = params.toString();
	return request<CourseListResponse>(`/course${suffix ? `?${suffix}` : ''}`);
}

// Creates a new course record.
export function createCourse(payload: CourseCreatePayload) {
	return request<Course>('/course', {
		method: 'POST',
		body: payload,
	});
}

// Updates an existing course record.
export function updateCourse(id: number, payload: CourseCreatePayload) {
	return request<Course>(`/course/${id}`, {
		method: 'PUT',
		body: payload,
	});
}

// Deletes a course after dependency checks pass.
export function deleteCourse(id: number) {
	return request<void>(`/course/${id}`, {
		method: 'DELETE',
	});
}

// Loads prerequisite relationships for one course.
export function listPrerequisites(courseId: number) {
	return request<PrerequisiteListResponse>(`/prerequisite/${courseId}`);
}

// Creates a prerequisite relationship between two courses.
export function createPrerequisite(courseId: number, prerequisiteId: number) {
	return request<Prerequisite>('/prerequisite', {
		method: 'POST',
		body: { cId: courseId, pId: prerequisiteId },
	});
}

// Deletes a prerequisite relationship.
export function deletePrerequisite(courseId: number, prerequisiteId: number) {
	return request<void>(`/prerequisite/${courseId}/${prerequisiteId}`, {
		method: 'DELETE',
	});
}

// Requests the semester list used in admin creation forms.
export function listSemesters() {
	return request<SemesterListResponse>('/semester');
}

// Creates a semester record.
export function createSemester(payload: Pick<Semester, 'term' | 'year'>) {
	return request<Semester>('/semester', {
		method: 'POST',
		body: payload,
	});
}

// Deletes a semester record.
export function deleteSemester(id: number) {
	return request<void>(`/semester/${id}`, {
		method: 'DELETE',
	});
}

// Requests paginated sections with admin-oriented filters.
export function listSections(query: SectionListQuery = {}) {
	const params = new URLSearchParams();

	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.search) params.set('search', query.search);
	if (query.crsId) params.set('crsId', String(query.crsId));
	if (query.semId) params.set('semId', String(query.semId));
	if (query.profId) params.set('profId', String(query.profId));
	if (query.subject) params.set('subject', query.subject);
	if (query.days) params.set('days', query.days);

	const suffix = params.toString();
	return request<SectionListResponse>(`/section${suffix ? `?${suffix}` : ''}`);
}

// Creates a section under the provided course id.
export function createSection(courseId: number, payload: SectionCreatePayload) {
	return request<Section>(`/section/${courseId}`, {
		method: 'POST',
		body: payload,
	});
}

// Updates a section's semester, professor, schedule, or capacity.
export function updateSection(id: number, payload: SectionUpdatePayload) {
	return request<Section>(`/section/${id}`, {
		method: 'PUT',
		body: payload,
	});
}

// Deletes a section record.
export function deleteSection(id: number) {
	return request<void>(`/section/${id}`, {
		method: 'DELETE',
	});
}
