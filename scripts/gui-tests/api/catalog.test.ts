import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createEnrollment,
	deleteEnrollment,
	getSection,
	listEnrollments,
	listPrerequisites,
	listSections,
	listSectionsBySemester,
	listSemesters,
	updateEnrollment,
} from '../../../frontend/src/api/catalog';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/client', () => ({
	request: requestMock,
}));

describe('catalog api', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('lists semesters from the semester endpoint', () => {
		listSemesters();
		expect(requestMock).toHaveBeenCalledWith('/semester');
	});

	it('lists sections with default pagination', () => {
		listSectionsBySemester({});
		expect(requestMock).toHaveBeenCalledWith('/section?page=1&limit=10');
	});

	it('includes semester, search, subject, and day filters when provided', () => {
		listSectionsBySemester({ page: 2, limit: 25, search: 'cmsc', semId: 4, subject: 'CMSC', days: 'TR' });
		expect(requestMock).toHaveBeenCalledWith('/section?page=2&limit=25&semId=4&search=cmsc&subject=CMSC&days=TR');
	});

	it('trims search-oriented catalog filters before sending them', () => {
		listSectionsBySemester({ search: '  data  ', subject: '  CMSC ', days: ' TR ' });
		expect(requestMock).toHaveBeenCalledWith('/section?page=1&limit=10&search=data&subject=CMSC&days=TR');
	});

	it('lists all sections for admin-style selection', () => {
		listSections();
		expect(requestMock).toHaveBeenCalledWith('/section?page=1&limit=100');
	});

	it('loads a single section by id', () => {
		getSection(77);
		expect(requestMock).toHaveBeenCalledWith('/section/77');
	});

	it('loads prerequisites for a course', () => {
		listPrerequisites(42);
		expect(requestMock).toHaveBeenCalledWith('/prerequisite/42');
	});

	it('lists enrollments for a student id', () => {
		listEnrollments(1001);
		expect(requestMock).toHaveBeenCalledWith('/enrollment?stuId=1001');
	});

	it('creates enrollments via POST', () => {
		createEnrollment({ stuId: 1, secId: 2 });
		expect(requestMock).toHaveBeenCalledWith('/enrollment', { method: 'POST', body: { stuId: 1, secId: 2 } });
	});

	it('updates enrollment status via PUT', () => {
		updateEnrollment(55, { status: 'dropped' });
		expect(requestMock).toHaveBeenCalledWith('/enrollment/55', { method: 'PUT', body: { status: 'dropped' } });
	});

	it('deletes enrollments via DELETE', () => {
		deleteEnrollment(88);
		expect(requestMock).toHaveBeenCalledWith('/enrollment/88', { method: 'DELETE' });
	});
});
