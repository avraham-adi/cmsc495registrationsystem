import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	createCourse,
	createPrerequisite,
	createSection,
	createSemester,
	createUser,
	deleteCourse,
	deletePrerequisite,
	deleteSection,
	deleteSemester,
	deleteUser,
	listCourses,
	listPrerequisites,
	listSections,
	listSemesters,
	listUsers,
	updateCourse,
	updateSection,
	updateUserRole,
} from '../../../frontend/src/api/admin';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/client', () => ({
	request: requestMock,
}));

describe('admin api', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('lists users with default query values omitted', () => {
		listUsers();
		expect(requestMock).toHaveBeenCalledWith('/admin');
	});

	it('lists users with role and search filters', () => {
		listUsers({ page: 2, limit: 50, search: 'lane', role: 'STUDENT' });
		expect(requestMock).toHaveBeenCalledWith('/admin?page=2&limit=50&search=lane&role=STUDENT');
	});

	it('creates and deletes users', () => {
		createUser({ name: 'User', email: 'user@example.edu', type: 'STUDENT', detail: 'Math' });
		deleteUser(4);
		expect(requestMock).toHaveBeenNthCalledWith(1, '/admin', expect.objectContaining({ method: 'POST' }));
		expect(requestMock).toHaveBeenNthCalledWith(2, '/admin/4', { method: 'DELETE' });
	});

	it('updates user roles', () => {
		updateUserRole(4, { type: 'PROFESSOR', detail: 'Science' });
		expect(requestMock).toHaveBeenCalledWith('/admin/4/role', { method: 'PUT', body: { type: 'PROFESSOR', detail: 'Science' } });
	});

	it('lists and mutates courses', () => {
		listCourses({ page: 3, limit: 25, search: 'compiler', subject: 'CMSC' });
		createCourse({ code: 'CMSC430', title: 'Compiler', desc: 'Compiler course', cred: 3 });
		updateCourse(9, { code: 'CMSC430', title: 'Compiler', desc: 'Compiler course', cred: 3 });
		deleteCourse(9);
		expect(requestMock).toHaveBeenNthCalledWith(1, '/course?page=3&limit=25&search=compiler&subject=CMSC');
		expect(requestMock).toHaveBeenNthCalledWith(2, '/course', expect.objectContaining({ method: 'POST' }));
		expect(requestMock).toHaveBeenNthCalledWith(3, '/course/9', expect.objectContaining({ method: 'PUT' }));
		expect(requestMock).toHaveBeenNthCalledWith(4, '/course/9', { method: 'DELETE' });
	});

	it('lists and mutates prerequisites', () => {
		listPrerequisites(10);
		createPrerequisite(10, 11);
		deletePrerequisite(10, 11);
		expect(requestMock).toHaveBeenNthCalledWith(1, '/prerequisite/10');
		expect(requestMock).toHaveBeenNthCalledWith(2, '/prerequisite', { method: 'POST', body: { cId: 10, pId: 11 } });
		expect(requestMock).toHaveBeenNthCalledWith(3, '/prerequisite/10/11', { method: 'DELETE' });
	});

	it('lists and mutates semesters', () => {
		listSemesters();
		createSemester({ term: 'Fall', year: 2026 });
		deleteSemester(3);
		expect(requestMock).toHaveBeenNthCalledWith(1, '/semester');
		expect(requestMock).toHaveBeenNthCalledWith(2, '/semester', { method: 'POST', body: { term: 'Fall', year: 2026 } });
		expect(requestMock).toHaveBeenNthCalledWith(3, '/semester/3', { method: 'DELETE' });
	});

	it('lists and mutates sections', () => {
		listSections({ page: 2, limit: 20, search: 'capstone', crsId: 10, semId: 4, profId: 6, subject: 'CMSC', days: 'TR' });
		createSection(10, { semId: 4, profId: 6, capacity: 20, days: 'TR', startTm: '10:00:00', endTm: '11:15:00' });
		updateSection(14, { semId: 4, profId: 6, capacity: 20 });
		deleteSection(14);
		expect(requestMock).toHaveBeenNthCalledWith(1, '/section?page=2&limit=20&search=capstone&crsId=10&semId=4&profId=6&subject=CMSC&days=TR');
		expect(requestMock).toHaveBeenNthCalledWith(2, '/section/10', expect.objectContaining({ method: 'POST' }));
		expect(requestMock).toHaveBeenNthCalledWith(3, '/section/14', expect.objectContaining({ method: 'PUT' }));
		expect(requestMock).toHaveBeenNthCalledWith(4, '/section/14', { method: 'DELETE' });
	});
});
