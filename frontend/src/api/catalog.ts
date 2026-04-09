import { request } from './client';
import type { Enrollment, EnrollmentCreatePayload, EnrollmentListResponse, EnrollmentUpdatePayload, SectionListResponse, SemesterListResponse } from '../types/api';

export function listSemesters() {
	return request<SemesterListResponse>('/semester');
}

export function listSectionsBySemester(semesterId: number, subject: string) {
	return request<SectionListResponse>(`/section?page=1&limit=100&semId=${semesterId}&search=${encodeURIComponent(subject)}`);
}

export function listSections() {
	return request<SectionListResponse>('/section?page=1&limit=100');
}

export function listEnrollments(studentId: number) {
	return request<EnrollmentListResponse>(`/enrollment?stuId=${studentId}`);
}

export function createEnrollment(payload: EnrollmentCreatePayload) {
	return request<Enrollment>('/enrollment', {
		method: 'POST',
		body: payload,
	});
}

export function updateEnrollment(enrollmentId: number, payload: EnrollmentUpdatePayload) {
	return request<Enrollment>(`/enrollment/${enrollmentId}`, {
		method: 'PUT',
		body: payload,
	});
}
