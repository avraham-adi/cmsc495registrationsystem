/*
Adi Avraham
CMSC495 Group Golf Capstone Project
studentEnrollment.ts
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Builds student enrollment, transcript, and weekly schedule data for dashboard views.
*/

import { getSection, listEnrollments, listSemesters } from '../api/catalog';
import type { Enrollment, EnrollmentStatus, Section, Semester } from '../types/api';
import { addDays, startOfWeek } from 'date-fns';

const TERM_RANK: Record<string, number> = {
	Spring: 1,
	Summer: 2,
	Fall: 3,
};

const DAY_LABELS: Record<string, string> = {
	M: 'Mon',
	T: 'Tue',
	W: 'Wed',
	R: 'Thu',
	F: 'Fri',
	S: 'Sat',
	U: 'Sun',
};

export type StudentEnrollmentData = {
	enrollments: Enrollment[];
	sections: Section[];
	semesters: Semester[];
};

export type EnrichedEnrollment = {
	enrollment: Enrollment;
	section: Section;
};

export type Event = {
	id: string;
	enrollmentId: number;
	sectionId: number;
	weekdayIndex: number;
	status: EnrollmentStatus;
	courseCode: string;
	title: string;
	scheduleText: string;
	startDate: Date;
	endDate: Date;
};

export type TranscriptSemesterGroup = {
	semester: Semester;
	items: EnrichedEnrollment[];
	totalCredits: number;
};

function weekday(days: string[]) {
	const codes = {
		'M': 0,
		'T': 1,
		'W': 2,
		'R': 3,
		'F': 4,
		'S': 5,
		'U': 6,
	};

	let daysNum = [];

	for (const day of days) {
		const value = codes[day as keyof typeof codes];
		if (typeof value === 'number') {
			daysNum.push(value);
		}
	}

	return daysNum;
}

export async function loadStudentEnrollmentData(studentId: number): Promise<StudentEnrollmentData> {
	const [semesterResponse, enrollmentResponse] = await Promise.all([listSemesters(), listEnrollments(studentId)]);
	const enrollments = enrollmentResponse.map((entry) => entry.Enrollment);
	const uniqueSectionIds = [...new Set(enrollments.map((enrollment) => enrollment.section_id))];
	const sections = uniqueSectionIds.length > 0 ? await Promise.all(uniqueSectionIds.map((sectionId) => getSection(sectionId))) : [];

	return {
		enrollments,
		sections,
		semesters: semesterResponse.map((entry) => entry.Semester),
	};
}

// Formats a Date object into a compact display time.
function eventDate(date: Date) {
	const d = date.toLocaleTimeString().split(':');
	const time = d[0] + ':' + d[1];
	const meridiem = ' ' + d[2].substring(3, 5);

	return time + meridiem;
}

// Formats event Days into human-readable days
function eventDays(days: string) {
	const d = days.split('');
	let dayView = '';

	d.map((str) => {
		return (dayView = dayView.concat(DAY_LABELS[str], '/'));
	});

	return dayView.trim().slice(0, dayView.length - 1);
}

export function formatSchedule(section: Section) {
	if (!section.days || section.days === 'async') {
		return 'Asynchronous';
	}

	if (!section.start_time || !section.end_time) {
		return section.days;
	}

	const s = section.start_time.split(':');
	const start = new Date();
	start.setHours(Number(s[0]), Number(s[1]), Number(s[2]));
	const e = section.end_time.split(':');
	const end = new Date();
	end.setHours(Number(e[0]), Number(e[1]), Number(e[2]));

	return `${eventDays(section.days)} - ${eventDate(start)}-${eventDate(end)}`;
}

export function buildEnrichedEnrollments(data: StudentEnrollmentData, semester?: number, statuses: EnrollmentStatus[] = ['enrolled', 'waitlisted']) {
	const sectionMap = new Map(data.sections.map((section) => [section.section_id, section]));
	return data.enrollments
		.filter((enrollment) => statuses.includes(enrollment.status))
		.map((enrollment) => {
			const section = sectionMap.get(enrollment.section_id);

			return section
				? {
						enrollment,
						section,
					}
				: null;
		})
		.filter((entry): entry is EnrichedEnrollment => entry !== null)
		.filter((entry) => !semester || entry.section.semester.semester_id === semester);
}

export function sortSemesters(semesters: Semester[]) {
	return [...semesters].sort((left, right) => {
		if (left.year !== right.year) {
			return right.year - left.year;
		}

		return (TERM_RANK[right.term] ?? 0) - (TERM_RANK[left.term] ?? 0);
	});
}

export function getCurrentSemester(semesters: Semester[]): Semester | null {
	const sorted = sortSemesters(semesters);
	return sorted.length > 0 ? sorted[0] : null;
}

export function isValidDayCombination(days: string) {
	if (!days || days === 'async') {
		return false;
	}

	return /^[MTWRFSU]+$/.test(days);
}

export function formatDayCombination(days: string) {
	if (!isValidDayCombination(days)) {
		return days;
	}

	return days
		.split('')
		.map((day) => DAY_LABELS[day] ?? day)
		.join(' / ');
}

export function calculateEnrollmentCredits(enrollments: EnrichedEnrollment[]) {
	return enrollments.reduce((total, entry) => total + (entry.section.course.credits ?? 0), 0);
}

export function groupEnrollmentsBySemester(enrollments: EnrichedEnrollment[]): TranscriptSemesterGroup[] {
	const groups = new Map<number, EnrichedEnrollment[]>();

	for (const enrollment of enrollments) {
		const key = enrollment.section.semester.semester_id;
		const current = groups.get(key) ?? [];
		current.push(enrollment);
		groups.set(key, current);
	}

	return [...groups.values()].map((items) => ({
		semester: items[0].section.semester,
		items: items.sort((left, right) => {
			const courseCompare = left.section.course.course_code.localeCompare(right.section.course.course_code);

			if (courseCompare !== 0) {
				return courseCompare;
			}

			const leftTime = left.section?.start_time ?? '99:99:99';
			const rightTime = right.section?.start_time ?? '99:99:99';
			return leftTime.localeCompare(rightTime);
		}),
		totalCredits: calculateEnrollmentCredits(items),
	}));
}

export function buildWeeklySchedule(enrollments: EnrichedEnrollment[]): Event[] {
	const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

	const events = enrollments.flatMap((enrollment: EnrichedEnrollment) => {
		if (!isValidDayCombination(enrollment.section.days)) {
			return [];
		}

		const { enrollment_id, status } = enrollment.enrollment;
		const courseCode = enrollment.section.course.course_code;
		const title = enrollment.section.course.title;
		const section_id = enrollment.section.section_id;
		const scheduleText = formatSchedule(enrollment.section);

		const [sHours, sMinutes, sSeconds] = enrollment.section?.start_time?.split(':').map(Number) ?? '99:99:99'.split(':').map(Number);
		const [eHours, eMinutes, eSeconds] = enrollment.section?.end_time?.split(':').map(Number) ?? '99:99:99'.split(':').map(Number);
		const days = enrollment.section.days;
		const daysNum = weekday(days.split(''));

		return daysNum.map((d) => {
			const start = addDays(weekStart, d);
			start.setHours(sHours, sMinutes, sSeconds, 0);

			const end = addDays(weekStart, d);
			end.setHours(eHours, eMinutes, eSeconds, 0);
			return {
				id: `${enrollment_id}-${d}`,
				enrollmentId: enrollment_id,
				sectionId: section_id,
				weekdayIndex: d,
				status,
				courseCode,
				title: title,
				scheduleText,
				startDate: start,
				endDate: end,
			};
		});
	});

	return events;
}

export function getAsyncEnrollments(enrollments: EnrichedEnrollment[]) {
	return enrollments.filter((entry) => entry.enrollment.status === 'enrolled' && (!entry.section?.days || entry.section.days === 'async'));
}
