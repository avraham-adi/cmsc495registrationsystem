/*
Adi Avraham
CMSC495 Group Golf Capstone Project
professor.ts
input
professor identifiers, section identifiers, and access-code operation inputs
output
typed API requests and helper transforms for professor teaching workflows
description
Wraps professor-facing section and access-code requests and small section sorting helpers.
*/

import { request } from './client';
import type { Section, SectionAccessCodeMap, SectionListResponse } from '../types/api';

// Requests the current professor's sections with a broad limit for grouped rendering.
export function listProfessorSections(professorId: number) {
	const params = new URLSearchParams({
		page: '1',
		limit: '100',
		profId: String(professorId),
	});

	return request<SectionListResponse>(`/section?${params.toString()}`);
}

// Loads the access-code map for one professor-owned section.
export function listSectionAccessCodes(sectionId: number) {
	return request<SectionAccessCodeMap>(`/section/${sectionId}/access-codes`);
}

// Generates one or more access codes for a professor-owned section.
export function generateSectionAccessCodes(sectionId: number, numCodes: number) {
	return request<SectionAccessCodeMap>(`/section/${sectionId}/access-codes`, {
		method: 'POST',
		body: { numCodes },
	});
}

// Revokes a single access code from a professor-owned section.
export function revokeSectionAccessCode(sectionId: number, code: string) {
	const params = new URLSearchParams({
		codes: code,
	});

	return request<void>(`/section/${sectionId}/access-codes?${params.toString()}`, {
		method: 'DELETE',
	});
}

// Unwraps the backend section envelope into a flat section array.
export function mapSectionList(response: SectionListResponse) {
	return response.Section.map((entry) => entry.Section);
}

// Sorts sections by course code and then section id for stable professor rendering.
export function sortSectionsByCourse(sections: Section[]) {
	return [...sections].sort((left, right) => {
		const courseCompare = left.course.course_code.localeCompare(right.course.course_code);
		if (courseCompare !== 0) {
			return courseCompare;
		}

		return left.section_id - right.section_id;
	});
}
