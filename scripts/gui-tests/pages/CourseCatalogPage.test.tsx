import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CourseCatalogPage } from '../../../frontend/src/pages/CourseCatalogPage';

const { useAuthMock, loadStudentEnrollmentDataMock, buildEnrichedEnrollmentsMock, listSectionsBySemesterMock, listPrerequisitesMock, createEnrollmentMock, updateEnrollmentMock } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	loadStudentEnrollmentDataMock: vi.fn(),
	buildEnrichedEnrollmentsMock: vi.fn(),
	listSectionsBySemesterMock: vi.fn(),
	listPrerequisitesMock: vi.fn(),
	createEnrollmentMock: vi.fn(),
	updateEnrollmentMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

vi.mock('../../../frontend/src/components/AppShell', () => ({
	StudentOnly: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../../frontend/src/api/catalog', () => ({
	listSectionsBySemester: listSectionsBySemesterMock,
	listPrerequisites: listPrerequisitesMock,
	createEnrollment: createEnrollmentMock,
	updateEnrollment: updateEnrollmentMock,
}));

vi.mock('../../../frontend/src/lib/studentEnrollment', () => ({
	loadStudentEnrollmentData: loadStudentEnrollmentDataMock,
	buildEnrichedEnrollments: buildEnrichedEnrollmentsMock,
	formatSchedule: (section: { days: string; start_time: string | null; end_time: string | null }) =>
		section.days === 'async' ? 'Asynchronous' : `${section.days} ${section.start_time?.slice(0, 5) ?? ''}-${section.end_time?.slice(0, 5) ?? ''}`.trim(),
	getCurrentSemester: (semesters: Array<{ semester_id: number }>) => semesters[0] ?? null,
	sortSemesters: (semesters: Array<unknown>) => semesters,
	isValidDayCombination: (days: string) => Boolean(days) && days !== 'async',
	formatDayCombination: (days: string) => days,
}));

const currentSemester = {
	semester_id: 20,
	term: 'Fall',
	year: 2026,
};

const previousSemester = {
	semester_id: 19,
	term: 'Spring',
	year: 2026,
};

const cmsc495Section = {
	section_id: 101,
	capacity: 25,
	enrolled_count: 25,
	waitlisted_count: 1,
	seats_available: 0,
	days: 'MWF',
	start_time: '09:00:00',
	end_time: '09:50:00',
	course: {
		course_id: 10,
		course_code: 'CMSC495',
		title: 'Capstone',
		description: 'Final project course',
		subject: 'CMSC',
		credits: 3,
	},
	professor: {
		professor_id: 5001,
		professor_name: 'Prof Parker',
	},
	semester: currentSemester,
};

const cmsc350Section = {
	section_id: 102,
	capacity: 25,
	enrolled_count: 25,
	waitlisted_count: 3,
	seats_available: 0,
	days: 'TR',
	start_time: '11:00:00',
	end_time: '12:15:00',
	course: {
		course_id: 11,
		course_code: 'CMSC350',
		title: 'Data Structures',
		description: 'Algorithms and structures',
		subject: 'CMSC',
		credits: 3,
	},
	professor: {
		professor_id: 5002,
		professor_name: 'Prof Lane',
	},
	semester: currentSemester,
};

const previousSection = {
	...cmsc495Section,
	section_id: 103,
	semester: previousSemester,
};

describe('CourseCatalogPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		useAuthMock.mockReturnValue({
			user: {
				id: 1,
				name: 'Ethan Walker',
				email: 'walke_etha001@guru.edu',
				first_login: false,
				role: 'STUDENT',
				role_id: 100001,
				role_details: 'Computer Science',
			},
			requiresPasswordChange: false,
		});

		loadStudentEnrollmentDataMock.mockResolvedValue({
			semesters: [currentSemester, previousSemester],
			enrollments: [],
			sections: [],
		});

		buildEnrichedEnrollmentsMock.mockImplementation((_data, semesterId, statuses) => {
			if (statuses?.includes('completed')) {
				return [
					{
						enrollment: { enrollment_id: 77, student_id: 100001, section_id: 501, status: 'completed' },
						section: {
							...cmsc350Section,
							section_id: 501,
						},
					},
				];
			}

			if (semesterId === currentSemester.semester_id) {
				return [];
			}

			return [];
		});

		listSectionsBySemesterMock.mockImplementation(async ({ semId, limit, days, search }: { semId: number; limit: number; days?: string; search?: string }) => {
			const allSections = semId === currentSemester.semester_id ? [cmsc495Section, cmsc350Section] : [previousSection];
			const filteredByDays = days ? allSections.filter((section) => section.days === days) : allSections;
			const filtered = search
				? filteredByDays.filter((section) =>
						`${section.course.course_code} ${section.course.title} ${section.course.description} ${section.professor.professor_name}`.toLowerCase().includes(search.toLowerCase())
					)
				: filteredByDays;
			return {
				Section: (limit === 100 ? allSections : filtered).map((Section) => ({ Section })),
				Meta: {
					page: 1,
					limit: limit ?? 10,
					total: filtered.length,
					totalPages: 1,
				},
			};
		});

		listPrerequisitesMock.mockImplementation(async (courseId: number) => {
			if (courseId === 10) {
				return [{ Prerequisite: { courseId: 11, courseCode: 'CMSC350', title: 'Data Structures' } }];
			}

			if (courseId === 11) {
				return [{ Prerequisite: { courseId: 12, courseCode: 'CMSC216', title: 'Programming' } }];
			}

			return [];
		});
	});

	it('renders prerequisite and waitlist chips for catalog cards', async () => {
		renderCatalogPage();

		expect(await screen.findByRole('heading', { name: /CMSC495 - Capstone/i })).toBeInTheDocument();
		expect(await screen.findByText('CMSC350')).toHaveClass('catalog-prerequisite-chip', 'complete');
		expect(await screen.findByText('CMSC216')).toHaveClass('catalog-prerequisite-chip', 'incomplete');
		expect(await screen.findByText('Waitlist Available')).toHaveClass('catalog-prerequisite-chip', 'complete');
		expect(await screen.findByText('Waitlist Full')).toHaveClass('catalog-prerequisite-chip', 'incomplete');
	});

	it('keeps meeting-day filter options persistent after selecting a day', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('heading', { name: /CMSC495 - Capstone/i });

		const daysSelect = screen.getByLabelText('Meeting Days');
		expect(within(daysSelect).getByRole('option', { name: 'MWF' })).toBeInTheDocument();
		expect(within(daysSelect).getByRole('option', { name: 'TR' })).toBeInTheDocument();

		await user.selectOptions(daysSelect, 'TR');

		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: /CMSC495 - Capstone/i })).not.toBeInTheDocument();
		});
		expect(screen.getByRole('heading', { name: /CMSC350 - Data Structures/i })).toBeInTheDocument();
		expect(within(daysSelect).getByRole('option', { name: 'MWF' })).toBeInTheDocument();
		expect(within(daysSelect).getByRole('option', { name: 'TR' })).toBeInTheDocument();
	});

	it('shows the empty-state message when no sections match the active filters', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('heading', { name: /CMSC495 - Capstone/i });
		await user.type(screen.getByLabelText('Search'), 'zzzz-not-found');

		await waitFor(() => {
			expect(screen.getByText('No sections matched the current filters.')).toBeInTheDocument();
		});
	});

	it('surfaces catalog load failures', async () => {
		listSectionsBySemesterMock.mockImplementation(async ({ limit }: { limit: number }) => {
			if (limit === 100) {
				return {
					Section: [cmsc495Section, cmsc350Section].map((Section) => ({ Section })),
					Meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
				};
			}

			throw new Error('Unable to load sections for that semester.');
		});
		renderCatalogPage();

		expect(await screen.findByText('Unable to load sections for that semester.')).toBeInTheDocument();
	});

	it('disables add-to-cart for previous-semester sections', async () => {
		const user = userEvent.setup();
		renderCatalogPage();

		await screen.findByRole('heading', { name: /CMSC495 - Capstone/i });
		await user.selectOptions(screen.getByLabelText('Semester'), String(previousSemester.semester_id));

		const addButton = await screen.findByRole('button', { name: 'Add To Cart' });
		expect(addButton).toBeDisabled();
	});
});

function renderCatalogPage() {
	return render(
		<MemoryRouter initialEntries={['/catalog']}>
			<Routes>
				<Route path="/catalog" element={<CourseCatalogPage />} />
			</Routes>
		</MemoryRouter>
	);
}
