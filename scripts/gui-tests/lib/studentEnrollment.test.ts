import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
	buildEnrichedEnrollments,
	buildWeeklySchedule,
	calculateEnrollmentCredits,
	formatDayCombination,
	formatSchedule,
	getAsyncEnrollments,
	groupEnrollmentsBySemester,
	loadStudentEnrollmentData,
	sortSemesters,
} from '../../../frontend/src/lib/studentEnrollment';

const { getSectionMock, listEnrollmentsMock, listSemestersMock } = vi.hoisted(() => ({
	getSectionMock: vi.fn(),
	listEnrollmentsMock: vi.fn(),
	listSemestersMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/catalog', () => ({
	getSection: getSectionMock,
	listEnrollments: listEnrollmentsMock,
	listSemesters: listSemestersMock,
}));

const semesters = [
	{ semester_id: 1, term: 'Spring', year: 2025 },
	{ semester_id: 2, term: 'Fall', year: 2025 },
	{ semester_id: 3, term: 'Summer', year: 2024 },
];

const sectionA = {
	section_id: 10,
	capacity: 25,
	enrolled_count: 20,
	waitlisted_count: 0,
	seats_available: 5,
	days: 'MWF',
	start_time: '09:00:00',
	end_time: '09:50:00',
	course: {
		course_id: 100,
		course_code: 'CMSC350',
		title: 'Data Structures',
		description: 'Structures',
		subject: 'CMSC',
		credits: 3,
	},
	professor: {
		professor_id: 5001,
		professor_name: 'Prof A',
	},
	semester: {
		semester_id: 2,
		term: 'Fall',
		year: 2025,
	},
};

const sectionB = {
	section_id: 11,
	capacity: 25,
	enrolled_count: 18,
	waitlisted_count: 2,
	seats_available: 7,
	days: 'TR',
	start_time: '11:00:00',
	end_time: '12:15:00',
	course: {
		course_id: 101,
		course_code: 'CMSC495',
		title: 'Capstone',
		description: 'Capstone course',
		subject: 'CMSC',
		credits: 6,
	},
	professor: {
		professor_id: 5002,
		professor_name: 'Prof B',
	},
	semester: {
		semester_id: 1,
		term: 'Spring',
		year: 2025,
	},
};

const asyncSection = {
	...sectionB,
	section_id: 12,
	days: 'async',
	start_time: null,
	end_time: null,
	course: {
		...sectionB.course,
		course_code: 'IFSM300',
		credits: 4,
	},
};

const enrollments = [
	{ enrollment_id: 1, student_id: 1, section_id: 10, status: 'enrolled' as const },
	{ enrollment_id: 2, student_id: 1, section_id: 11, status: 'waitlisted' as const },
	{ enrollment_id: 3, student_id: 1, section_id: 12, status: 'completed' as const },
];

describe('studentEnrollment', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useRealTimers();
	});

	it('formats asynchronous sections as Asynchronous', () => {
		expect(formatSchedule(asyncSection)).toBe('Asynchronous');
	});

	it('formats sections with days but no times as the raw meeting days', () => {
		expect(formatSchedule({ ...sectionA, start_time: null, end_time: null })).toBe('Mon / Wed / Fri');
	});

	it('formats scheduled sections with times', () => {
		expect(formatSchedule(sectionA)).toBe('Mon / Wed / Fri - 09:00-09:50');
	});

	it('formats canonical day combinations into human-readable labels', () => {
		expect(formatDayCombination('TR')).toBe('Tue / Thu');
	});

	it('builds enriched enrollments for the default active statuses', () => {
		const data = { enrollments, sections: [sectionA, sectionB, asyncSection], semesters };
		expect(buildEnrichedEnrollments(data)).toHaveLength(2);
	});

	it('filters enriched enrollments by semester when provided', () => {
		const data = { enrollments, sections: [sectionA, sectionB, asyncSection], semesters };
		const result = buildEnrichedEnrollments(data, 2, ['enrolled', 'waitlisted', 'completed']);
		expect(result).toHaveLength(1);
		expect(result[0].section.section_id).toBe(10);
	});

	it('excludes enrollments whose sections are missing from the loaded dataset', () => {
		const data = { enrollments, sections: [sectionA], semesters };
		expect(buildEnrichedEnrollments(data, undefined, ['enrolled', 'waitlisted', 'completed'])).toHaveLength(1);
	});

	it('filters enriched enrollments by explicit statuses', () => {
		const data = { enrollments, sections: [sectionA, sectionB, asyncSection], semesters };
		const result = buildEnrichedEnrollments(data, undefined, ['completed']);
		expect(result).toHaveLength(1);
		expect(result[0].enrollment.status).toBe('completed');
	});

	it('sorts semesters by year descending then term rank', () => {
		const result = sortSemesters(semesters);
		expect(result.map((semester) => `${semester.year}-${semester.term}`)).toEqual(['2025-Fall', '2025-Spring', '2024-Summer']);
	});

	it('places unknown terms after ranked terms within the same year', () => {
		const result = sortSemesters([
			{ semester_id: 4, term: 'Winter', year: 2025 },
			{ semester_id: 2, term: 'Fall', year: 2025 },
		]);
		expect(result.map((semester) => semester.term)).toEqual(['Fall', 'Winter']);
	});

	it('calculates total credits from enriched enrollments', () => {
		const total = calculateEnrollmentCredits([
			{ enrollment: enrollments[0], section: sectionA },
			{ enrollment: enrollments[1], section: sectionB },
		]);
		expect(total).toBe(9);
	});

	it('returns zero credits for an empty enrollment collection', () => {
		expect(calculateEnrollmentCredits([])).toBe(0);
	});

	it('groups enrollments by semester id', () => {
		const result = groupEnrollmentsBySemester([
			{ enrollment: enrollments[0], section: sectionA },
			{ enrollment: enrollments[1], section: sectionB },
		]);
		expect(result).toHaveLength(2);
	});

	it('sorts grouped semester items by course code then start time', () => {
		const early = { ...sectionA, section_id: 13, start_time: '08:00:00', course: { ...sectionA.course, course_code: 'CMSC350' } };
		const late = { ...sectionA, section_id: 14, start_time: '10:00:00', course: { ...sectionA.course, course_code: 'CMSC350' } };
		const result = groupEnrollmentsBySemester([
			{ enrollment: { ...enrollments[0], enrollment_id: 4, section_id: 14 }, section: late },
			{ enrollment: { ...enrollments[0], enrollment_id: 5, section_id: 13 }, section: early },
		]);
		expect(result[0].items.map((item) => item.section.section_id)).toEqual([13, 14]);
	});

	it('computes total credits per transcript semester group', () => {
		const result = groupEnrollmentsBySemester([
			{ enrollment: enrollments[0], section: sectionA },
			{ enrollment: { ...enrollments[0], enrollment_id: 7, section_id: 13 }, section: { ...sectionA, section_id: 13, course: { ...sectionA.course, credits: 4 } } },
		]);
		expect(result[0].totalCredits).toBe(7);
	});

	it('builds one weekly event per scheduled meeting day', () => {
		const result = buildWeeklySchedule([{ enrollment: enrollments[0], section: sectionA }]);
		expect(result).toHaveLength(3);
		expect(result.every((event) => event.courseCode === 'CMSC350')).toBe(true);
	});

	it('anchors weekly events to the current Monday-based week', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-04-15T12:00:00Z'));

		const result = buildWeeklySchedule([{ enrollment: enrollments[0], section: sectionA }]);

		expect(result.map((event) => event.startDate.getDay())).toEqual([1, 3, 5]);
	});

	it('skips asynchronous sections when building weekly schedule events', () => {
		const result = buildWeeklySchedule([{ enrollment: { ...enrollments[2], status: 'completed' }, section: asyncSection }]);
		expect(result).toEqual([]);
	});

	it('preserves enrollment status in weekly schedule events', () => {
		const result = buildWeeklySchedule([{ enrollment: { ...enrollments[1], status: 'waitlisted' }, section: sectionB }]);
		expect(result[0].status).toBe('waitlisted');
	});

	it('creates stable schedule event ids using enrollment and weekday', () => {
		const result = buildWeeklySchedule([{ enrollment: enrollments[0], section: sectionA }]);
		expect(result[0].id).toMatch(/^1-/);
	});

	it('filters async enrolled courses for the async panel', () => {
		const result = getAsyncEnrollments([
			{ enrollment: enrollments[0], section: sectionA },
			{ enrollment: { ...enrollments[2], status: 'enrolled' }, section: asyncSection },
		]);
		expect(result).toHaveLength(1);
		expect(result[0].section.section_id).toBe(12);
	});

	it('excludes non-enrolled async records from the async panel', () => {
		const result = getAsyncEnrollments([{ enrollment: enrollments[2], section: asyncSection }]);
		expect(result).toHaveLength(0);
	});

	it('loads student enrollment data by fetching semesters and enrollments', async () => {
		listSemestersMock.mockResolvedValue([{ Semester: semesters[0] }]);
		listEnrollmentsMock.mockResolvedValue([{ Enrollment: enrollments[0] }]);
		getSectionMock.mockResolvedValue(sectionA);

		const result = await loadStudentEnrollmentData(1);

		expect(listSemestersMock).toHaveBeenCalledTimes(1);
		expect(listEnrollmentsMock).toHaveBeenCalledWith(1);
		expect(getSectionMock).toHaveBeenCalledWith(10);
		expect(result.sections).toEqual([sectionA]);
	});

	it('deduplicates section fetches when multiple enrollments share a section', async () => {
		listSemestersMock.mockResolvedValue([{ Semester: semesters[0] }]);
		listEnrollmentsMock.mockResolvedValue([{ Enrollment: enrollments[0] }, { Enrollment: { ...enrollments[0], enrollment_id: 8 } }]);
		getSectionMock.mockResolvedValue(sectionA);

		await loadStudentEnrollmentData(1);

		expect(getSectionMock).toHaveBeenCalledTimes(1);
	});

	it('skips section fetches when the student has no enrollments', async () => {
		listSemestersMock.mockResolvedValue([{ Semester: semesters[0] }]);
		listEnrollmentsMock.mockResolvedValue([]);

		const result = await loadStudentEnrollmentData(1);

		expect(getSectionMock).not.toHaveBeenCalled();
		expect(result.sections).toEqual([]);
	});

	it('handles concurrent section fetch resolution order without changing the returned section set', async () => {
		listSemestersMock.mockResolvedValue([{ Semester: semesters[0] }]);
		listEnrollmentsMock.mockResolvedValue([{ Enrollment: enrollments[0] }, { Enrollment: enrollments[1] }]);
		getSectionMock.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(sectionA), 20))).mockImplementationOnce(() => Promise.resolve(sectionB));

		const result = await loadStudentEnrollmentData(1);

		expect(result.sections).toEqual([sectionA, sectionB]);
	});
});
