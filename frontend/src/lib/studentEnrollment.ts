import { listEnrollments, listSections } from '../api/catalog';
import type { Enrollment, EnrollmentStatus, Section } from '../types/api';

export type StudentEnrollmentData = {
	sections: Section[],
	enrollments: Enrollment[],
};

export type EnrichedEnrollment = {
	enrollment: Enrollment,
	section: Section | null,
};

export type WeeklyScheduleDay = {
	code: string,
	label: string,
	items: EnrichedEnrollment[],
};

const WEEKDAY_LABELS: Array<{ code: string, label: string }> = [
	{ code: 'M', label: 'Monday' },
	{ code: 'T', label: 'Tuesday' },
	{ code: 'W', label: 'Wednesday' },
	{ code: 'R', label: 'Thursday' },
	{ code: 'F', label: 'Friday' },
	{ code: 'S', label: 'Saturday' },
	{ code: 'U', label: 'Sunday' },
];

export async function loadStudentEnrollmentData(studentId: number): Promise<StudentEnrollmentData> {
	const [sectionResponse, enrollmentResponse] = await Promise.all([listSections(), listEnrollments(studentId)]);

	return {
		sections: sectionResponse.Section.map((entry) => entry.Section),
		enrollments: enrollmentResponse.map((entry) => entry.Enrollment),
	};
}

export function formatSchedule(section: Section) {
	if (!section.days || section.days === 'async') {
		return 'Asynchronous';
	}

	if (!section.start_time || !section.end_time) {
		return section.days;
	}

	return `${section.days} - ${section.start_time.slice(0, 5)}-${section.end_time.slice(0, 5)}`;
}

export function buildEnrichedEnrollments(data: StudentEnrollmentData, statuses: EnrollmentStatus[] = ['enrolled', 'waitlisted']) {
	const semesterMap = new Map(data.sections.map((section) => [section.semester.semester_id, section]));
	const courseMap = new Map(data.sections.map((section) => [section.course.course_id, section]));
	const sectionMap = new Map(data.sections.map((section) => [section.section_id, section]));

	return data.enrollments
		.filter((enrollment) => statuses.includes(enrollment.status))
		.map((enrollment) => {
			const section = sectionMap.get(enrollment.section_id) ?? null;

			return {
				enrollment,
				section,
				course: section ? (courseMap.get(section.course.course_id) ?? null) : null,
				semester: section ? (semesterMap.get(section.semester.semester_id) ?? null) : null,
			};
		});
}

export function groupEnrollmentsBySemester(enrollments: EnrichedEnrollment[]) {
	const groups = new Map<number | 'unknown', EnrichedEnrollment[]>();

	for (const enrollment of enrollments) {
		const key = enrollment.section?.semester?.semester_id ?? 'unknown';
		const current = groups.get(key) ?? [];
		current.push(enrollment);
		groups.set(key, current);
	}

	return [...groups.entries()].map(([key, items]) => ({
		semester: key === 'unknown' ? null : (items[0]?.section?.semester ?? null),
		items: items.sort((left, right) => {
			const leftTime = left.section?.start_time ?? '99:99:99';
			const rightTime = right.section?.start_time ?? '99:99:99';
			return leftTime.localeCompare(rightTime);
		}),
	}));
}

export function buildWeeklySchedule(enrollments: EnrichedEnrollment[]): WeeklyScheduleDay[] {
	return WEEKDAY_LABELS.map(({ code, label }) => ({
		code,
		label,
		items: enrollments
			.filter((entry) => entry.enrollment.status === 'enrolled' && entry.section?.days && entry.section.days !== 'async' && entry.section.days.includes(code))
			.sort((left, right) => {
				const leftTime = left.section?.start_time ?? '99:99:99';
				const rightTime = right.section?.start_time ?? '99:99:99';
				return leftTime.localeCompare(rightTime);
			}),
	}));
}

export function getAsyncEnrollments(enrollments: EnrichedEnrollment[]) {
	return enrollments.filter((entry) => entry.enrollment.status === 'enrolled' && (!entry.section?.days || entry.section.days === 'async'));
}
