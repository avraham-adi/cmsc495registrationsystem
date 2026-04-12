import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfessorSectionsPage } from '../../../frontend/src/pages/ProfessorSectionsPage';
import { ApiError } from '../../../frontend/src/api/client';

const {
	useAuthMock,
	listProfessorSectionsMock,
	listSectionAccessCodesMock,
	generateSectionAccessCodesMock,
	revokeSectionAccessCodeMock,
} = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	listProfessorSectionsMock: vi.fn(),
	listSectionAccessCodesMock: vi.fn(),
	generateSectionAccessCodesMock: vi.fn(),
	revokeSectionAccessCodeMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

vi.mock('../../../frontend/src/api/professor', () => ({
	listProfessorSections: listProfessorSectionsMock,
	listSectionAccessCodes: listSectionAccessCodesMock,
	generateSectionAccessCodes: generateSectionAccessCodesMock,
	revokeSectionAccessCode: revokeSectionAccessCodeMock,
	mapSectionList: (response: { Section: Array<{ Section: unknown }> }) => response.Section.map((entry) => entry.Section),
	sortSectionsByCourse: (sections: Array<{ course: { course_code: string }, section_id: number }>) =>
		[...sections].sort((left, right) => left.course.course_code.localeCompare(right.course.course_code) || left.section_id - right.section_id),
}));

const professorUser = {
	id: 2,
	name: 'Prof Parker',
	email: 'parker@example.edu',
	first_login: false,
	role: 'PROFESSOR' as const,
	role_id: 50020001,
	role_details: 'Computer Science',
};

const sections = [
	{
		section_id: 40,
		capacity: 25,
		enrolled_count: 20,
		seats_available: 5,
		days: 'TR',
		start_time: '13:00:00',
		end_time: '14:15:00',
		course: {
			course_id: 10,
			course_code: 'CMSC495',
			title: 'Current Trends and Projects in Computer Science',
			description: 'Capstone course',
			subject: 'CMSC',
			credits: 3,
		},
		professor: {
			professor_id: 50020001,
			professor_name: 'Prof Parker',
		},
		semester: {
			semester_id: 20,
			term: 'Fall',
			year: 2026,
		},
	},
	{
		section_id: 18,
		capacity: 18,
		enrolled_count: 17,
		seats_available: 1,
		days: 'MW',
		start_time: '10:00:00',
		end_time: '11:15:00',
		course: {
			course_id: 8,
			course_code: 'CMSC320',
			title: 'Relational Database Concepts and Applications',
			description: 'Database systems',
			subject: 'CMSC',
			credits: 3,
		},
		professor: {
			professor_id: 50020001,
			professor_name: 'Prof Parker',
		},
		semester: {
			semester_id: 19,
			term: 'Spring',
			year: 2026,
		},
	},
	{
		section_id: 50,
		capacity: 30,
		enrolled_count: 28,
		seats_available: 2,
		days: 'async',
		start_time: null,
		end_time: null,
		course: {
			course_id: 14,
			course_code: 'MATH115',
			title: 'Precalculus',
			description: 'Math foundations',
			subject: 'MATH',
			credits: 3,
		},
		professor: {
			professor_id: 50020001,
			professor_name: 'Prof Parker',
		},
		semester: {
			semester_id: 20,
			term: 'Fall',
			year: 2026,
		},
	},
];

let sectionCodes: Record<number, Record<string, string | boolean>> = {
	40: {
		code1: 'ABCD-1234',
		code1_used: false,
		code2: 'WXYZ-9999',
		code2_used: true,
	},
	18: {
		code1: 'DBMS-1111',
		code1_used: false,
	},
	50: {
		code1: 'MATH-5050',
		code1_used: false,
	},
};

describe('ProfessorSectionsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		sectionCodes = {
			40: {
				code1: 'ABCD-1234',
				code1_used: false,
				code2: 'WXYZ-9999',
				code2_used: true,
			},
			18: {
				code1: 'DBMS-1111',
				code1_used: false,
			},
			50: {
				code1: 'MATH-5050',
				code1_used: false,
			},
		};

		useAuthMock.mockReturnValue({
			user: professorUser,
			requiresPasswordChange: false,
			updateProfileAction: vi.fn().mockResolvedValue({}),
			changePasswordAction: vi.fn().mockResolvedValue({}),
			refreshUser: vi.fn().mockResolvedValue(professorUser),
		});

		listProfessorSectionsMock.mockResolvedValue({
			Section: sections.map((Section) => ({ Section })),
			Meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
		});
		listSectionAccessCodesMock.mockImplementation(async (sectionId: number) => sectionCodes[sectionId as keyof typeof sectionCodes]);
		generateSectionAccessCodesMock.mockImplementation(async (_sectionId: number, _count: number) => ({}));
		revokeSectionAccessCodeMock.mockResolvedValue(undefined);
	});

	it('renders professor home with compact section rows grouped by subject', async () => {
		renderProfessorPage();

		expect(await screen.findByRole('heading', { name: 'Professor Home' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Sections' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Password' })).toBeInTheDocument();
		expect(screen.getByText('MATH Sections')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Previous Semesters Archive 1 section' })).toBeInTheDocument();
		expect(await screen.findByText('Current Trends and Projects in Computer Science')).toBeInTheDocument();
		expect(screen.queryByText('ABCD-1234')).not.toBeInTheDocument();
	});

	it('opens the previous-semester archive on demand', async () => {
		const user = userEvent.setup();
		renderProfessorPage();

		const archiveToggle = await screen.findByRole('button', { name: 'Previous Semesters Archive 1 section' });
		expect(screen.queryByText('CMSC320')).not.toBeInTheDocument();

		await user.click(archiveToggle);
		expect(screen.getByText('CMSC320')).toBeInTheDocument();
	});

	it('opens a compact access-code dialog for a selected section', async () => {
		const user = userEvent.setup();
		renderProfessorPage();

		const sectionRow = (await screen.findByText('CMSC495')).closest('article') as HTMLElement;
		await user.click(within(sectionRow).getByRole('button', { name: 'Access Codes' }));

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'CMSC495 Access Codes' })).toBeInTheDocument();
		expect(screen.getByText('ABCD-1234')).toBeInTheDocument();
		expect(screen.getByText('Status: Used')).toBeInTheDocument();
	});

	it('generates additional access codes from the dialog', async () => {
		const user = userEvent.setup();
		generateSectionAccessCodesMock.mockImplementationOnce(async () => {
			sectionCodes[40] = {
				...sectionCodes[40],
				code3: 'NEWA-2026',
				code3_used: false,
				code4: 'NEWB-2026',
				code4_used: false,
			};
			return {};
		});

		renderProfessorPage();

		const sectionRow = (await screen.findByText('CMSC495')).closest('article') as HTMLElement;
		await user.click(within(sectionRow).getByRole('button', { name: 'Access Codes' }));

		const dialog = await screen.findByRole('dialog');
		await user.clear(within(dialog).getByLabelText('Codes to Generate'));
		await user.type(within(dialog).getByLabelText('Codes to Generate'), '2');
		await user.click(within(dialog).getByRole('button', { name: 'Generate' }));

		await waitFor(() => {
			expect(generateSectionAccessCodesMock).toHaveBeenCalledWith(40, 2);
		});

		expect(await within(dialog).findByText('2 access codes generated.')).toBeInTheDocument();
		expect(within(dialog).getByText('NEWA-2026')).toBeInTheDocument();
	});

	it('shows inline backend validation errors in the access-code dialog', async () => {
		const user = userEvent.setup();
		generateSectionAccessCodesMock.mockRejectedValueOnce(new Error('Number of access codes must be 25 or fewer.'));
		renderProfessorPage();

		const sectionRow = (await screen.findByText('CMSC495')).closest('article') as HTMLElement;
		await user.click(within(sectionRow).getByRole('button', { name: 'Access Codes' }));

		const dialog = await screen.findByRole('dialog');
		await user.clear(within(dialog).getByLabelText('Codes to Generate'));
		await user.type(within(dialog).getByLabelText('Codes to Generate'), '30');
		await user.click(within(dialog).getByRole('button', { name: 'Generate' }));

		expect(await within(dialog).findByText('Number of access codes must be 25 or fewer.')).toBeInTheDocument();
	});

	it('revokes an access code from the dialog', async () => {
		const user = userEvent.setup();
		revokeSectionAccessCodeMock.mockImplementationOnce(async () => {
			sectionCodes[40] = {
				code2: 'WXYZ-9999',
				code2_used: true,
			};
		});

		renderProfessorPage();

		const sectionRow = (await screen.findByText('CMSC495')).closest('article') as HTMLElement;
		await user.click(within(sectionRow).getByRole('button', { name: 'Access Codes' }));

		const dialog = await screen.findByRole('dialog');
		await user.click(within(dialog).getAllByRole('button', { name: 'Revoke' })[0]);

		await waitFor(() => {
			expect(revokeSectionAccessCodeMock).toHaveBeenCalledWith(40, 'ABCD-1234');
		});

		expect(await within(dialog).findByText('Access code revoked.')).toBeInTheDocument();
		expect(within(dialog).queryByText('ABCD-1234')).not.toBeInTheDocument();
	});

	it('shows inline revoke failures in the dialog', async () => {
		const user = userEvent.setup();
		revokeSectionAccessCodeMock.mockRejectedValueOnce(new Error('Professors may only manage access codes for their own sections.'));
		renderProfessorPage();

		const sectionRow = (await screen.findByText('CMSC495')).closest('article') as HTMLElement;
		await user.click(within(sectionRow).getByRole('button', { name: 'Access Codes' }));

		const dialog = await screen.findByRole('dialog');
		await user.click(within(dialog).getAllByRole('button', { name: 'Revoke' })[0]);

		expect(await within(dialog).findByText('Professors may only manage access codes for their own sections.')).toBeInTheDocument();
		expect(within(dialog).getByText('ABCD-1234')).toBeInTheDocument();
	});

	it('switches to the profile view and updates the professor profile', async () => {
		const user = userEvent.setup();
		const updateProfileAction = vi.fn().mockResolvedValue({});
		useAuthMock.mockReturnValue({
			user: professorUser,
			requiresPasswordChange: false,
			updateProfileAction,
			changePasswordAction: vi.fn().mockResolvedValue({}),
		});

		renderProfessorPage();

		await user.click(await screen.findByRole('button', { name: 'Profile' }));
		await user.clear(screen.getByLabelText('Name'));
		await user.type(screen.getByLabelText('Name'), 'Prof Updated');
		await user.click(screen.getByRole('button', { name: 'Save Profile' }));

		await waitFor(() => {
			expect(updateProfileAction).toHaveBeenCalledWith({ name: 'Prof Updated', email: 'parker@example.edu' });
		});

		expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
	});

	it('switches back to the sections view after a successful password change', async () => {
		const user = userEvent.setup();
		const changePasswordAction = vi.fn().mockResolvedValue(professorUser);
		useAuthMock.mockReturnValue({
			user: professorUser,
			requiresPasswordChange: false,
			updateProfileAction: vi.fn().mockResolvedValue({}),
			changePasswordAction,
			refreshUser: vi.fn().mockResolvedValue(professorUser),
		});

		renderProfessorPage();

		await user.click(await screen.findByRole('button', { name: 'Password' }));
		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		await waitFor(() => {
			expect(changePasswordAction).toHaveBeenCalledWith({ password: 'Password123!' });
		});
		expect(await screen.findByRole('heading', { name: 'Sections and Access Codes' })).toBeInTheDocument();
	});

	it('shows a password mismatch error in the professor password view', async () => {
		const user = userEvent.setup();
		renderProfessorPage();

		await user.click(await screen.findByRole('button', { name: 'Password' }));
		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123?');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
	});

	it('shows an empty state when the professor has no assigned sections', async () => {
		listProfessorSectionsMock.mockResolvedValueOnce({
			Section: [],
			Meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
		});

		renderProfessorPage();

		expect(await screen.findByRole('heading', { name: 'No Assigned Sections' })).toBeInTheDocument();
	});

	it('shows a page-level error when professor section loading fails', async () => {
		listProfessorSectionsMock.mockRejectedValueOnce(new Error('Unable to load professor sections right now.'));

		renderProfessorPage();

		expect(await screen.findByText('Unable to load professor sections right now.')).toBeInTheDocument();
	});

	it('renders the password-required message and locks sections/profile tabs when necessary', async () => {
		useAuthMock.mockReturnValue({
			user: professorUser,
			requiresPasswordChange: true,
			updateProfileAction: vi.fn().mockResolvedValue({}),
			changePasswordAction: vi.fn().mockResolvedValue({}),
		});

		renderProfessorPage();

		expect((await screen.findByRole('button', { name: 'Sections' })).hasAttribute('disabled')).toBe(true);
		expect(screen.getByRole('button', { name: 'Profile' })).toBeDisabled();
		await userEvent.setup().click(screen.getByRole('button', { name: 'Password' }));
		expect(screen.getByText('It appears to be your first time logging in. Password change is mandatory.')).toBeInTheDocument();
	});

	it('redirects non-professors to the profile route', () => {
		useAuthMock.mockReturnValue({
			user: {
				...professorUser,
				role: 'STUDENT',
			},
			requiresPasswordChange: false,
			updateProfileAction: vi.fn(),
			changePasswordAction: vi.fn(),
		});

		render(
			<MemoryRouter initialEntries={['/professor/sections']}>
				<Routes>
					<Route path="/professor/sections" element={<ProfessorSectionsPage />} />
					<Route path="/profile" element={<div>Profile Route</div>} />
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText('Profile Route')).toBeInTheDocument();
	});

	it('surfaces api profile errors inside the professor profile view', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			user: professorUser,
			requiresPasswordChange: false,
			updateProfileAction: vi.fn().mockRejectedValue(new ApiError(400, { error: 'Email already in use.' })),
			changePasswordAction: vi.fn().mockResolvedValue({}),
		});

		renderProfessorPage();

		await user.click(await screen.findByRole('button', { name: 'Profile' }));
		await user.click(screen.getByRole('button', { name: 'Save Profile' }));

		expect(await screen.findByText('Email already in use.')).toBeInTheDocument();
	});
});

function renderProfessorPage() {
	return render(
		<MemoryRouter initialEntries={['/']}>
			<Routes>
				<Route path="/" element={<ProfessorSectionsPage />} />
				<Route path="/profile" element={<div>Profile</div>} />
			</Routes>
		</MemoryRouter>
	);
}
