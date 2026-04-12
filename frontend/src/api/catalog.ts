/*
Adi Avraham
CMSC495 Group Golf Capstone Project
catalog.ts
input
catalog filters, enrollment payloads, and course or section identifiers
output
typed API requests for catalog, semester, prerequisite, and enrollment workflows
description
Wraps student-facing catalog and enrollment HTTP requests behind typed helper functions.
*/

import { request } from './client';
import type { Enrollment, EnrollmentCreatePayload, EnrollmentListResponse, EnrollmentUpdatePayload, PrerequisiteListResponse, Section, SectionListResponse, SemesterListResponse } from '../types/api';

export type SectionListParams = {
	page?: number,
	limit?: number,
	search?: string,
	semId?: number | null,
	subject?: string,
	days?: string,
};

// Requests the semester list used by student, professor, and admin views.
export function listSemesters() {
	return request<SemesterListResponse>('/semester');
}

// Requests paginated section results for the active semester and catalog filters.
export function listSectionsBySemester({ page = 1, limit = 10, search = '', semId = null, subject = '', days = '' }: SectionListParams) {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	if (semId !== null) {
		params.set('semId', String(semId));
	}

	if (search.trim() !== '') {
		params.set('search', search.trim());
	}

	if (subject.trim() !== '') {
		params.set('subject', subject.trim());
	}

	if (days.trim() !== '') {
		params.set('days', days.trim());
	}

	return request<SectionListResponse>(`/section?${params.toString()}`);
}

// Loads a broader section list for filter option derivation and admin-style utilities.
export function listSections() {
	return request<SectionListResponse>('/section?page=1&limit=100');
}

// Fetches a single section by id.
export function getSection(sectionId: number) {
	return request<Section>(`/section/${sectionId}`);
}

// Fetches the prerequisite relationships for a course card.
export function listPrerequisites(courseId: number) {
	return request<PrerequisiteListResponse>(`/prerequisite/${courseId}`);
}

// Fetches all enrollments for the current student.
export function listEnrollments(studentId: number) {
	return request<EnrollmentListResponse>(`/enrollment?stuId=${studentId}`);
}

// Creates a new enrollment or waitlist record for the current student.
export function createEnrollment(payload: EnrollmentCreatePayload) {
	return request<Enrollment>('/enrollment', {
		method: 'POST',
		body: payload,
	});
}

// Updates an enrollment status, including drop or access-code promotion flows.
export function updateEnrollment(enrollmentId: number, payload: EnrollmentUpdatePayload) {
	return request<Enrollment>(`/enrollment/${enrollmentId}`, {
		method: 'PUT',
		body: payload,
	});
}

// Deletes an enrollment record through the admin cleanup path.
export function deleteEnrollment(enrollmentId: number) {
	return request<void>(`/enrollment/${enrollmentId}`, {
		method: 'DELETE',
	});
}
