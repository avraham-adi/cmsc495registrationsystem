import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminConsolePage } from '../../../frontend/src/pages/AdminConsolePage';

const {
	useAuthMock,
	listUsersMock,
	listCoursesMock,
	listSemestersMock,
	listSectionsMock,
	listPrerequisitesMock,
	createUserMock,
	updateUserRoleMock,
	deleteUserMock,
	createCourseMock,
	updateCourseMock,
	createSemesterMock,
	createSectionMock,
	deleteCourseMock,
	deleteSemesterMock,
	deleteSectionMock,
	createPrerequisiteMock,
	deletePrerequisiteMock,
} = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	listUsersMock: vi.fn(),
	listCoursesMock: vi.fn(),
	listSemestersMock: vi.fn(),
	listSectionsMock: vi.fn(),
	listPrerequisitesMock: vi.fn(),
	createUserMock: vi.fn(),
	updateUserRoleMock: vi.fn(),
	deleteUserMock: vi.fn(),
	createCourseMock: vi.fn(),
	updateCourseMock: vi.fn(),
	createSemesterMock: vi.fn(),
	createSectionMock: vi.fn(),
	deleteCourseMock: vi.fn(),
	deleteSemesterMock: vi.fn(),
	deleteSectionMock: vi.fn(),
	createPrerequisiteMock: vi.fn(),
	deletePrerequisiteMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

vi.mock('../../../frontend/src/api/admin', () => ({
	listUsers: listUsersMock,
	listCourses: listCoursesMock,
	listSemesters: listSemestersMock,
	listSections: listSectionsMock,
	listPrerequisites: listPrerequisitesMock,
	createUser: createUserMock,
	updateUserRole: updateUserRoleMock,
	deleteUser: deleteUserMock,
	createCourse: createCourseMock,
	updateCourse: updateCourseMock,
	createSemester: createSemesterMock,
	createSection: createSectionMock,
	deleteCourse: deleteCourseMock,
	deleteSemester: deleteSemesterMock,
	deleteSection: deleteSectionMock,
	createPrerequisite: createPrerequisiteMock,
	deletePrerequisite: deletePrerequisiteMock,
	updateSection: vi.fn(),
}));

const adminUser = {
	id: 1,
	name: 'Admin Runner',
	email: 'admin@example.edu',
	first_login: false,
	role: 'ADMIN' as const,
	role_id: 90010001,
	role_details: 'Registrar',
};

const professorUser = {
	id: 2,
	name: 'Prof Parker',
	email: 'parker@example.edu',
	first_login: false,
	role: 'PROFESSOR' as const,
	role_id: 50020001,
	role_details: 'Computer Science',
};

const mathProfessorUser = {
	id: 4,
	name: 'Prof Newton',
	email: 'newton@example.edu',
	first_login: false,
	role: 'PROFESSOR' as const,
	role_id: 50020002,
	role_details: 'Mathematics',
};

const studentUser = {
	id: 3,
	name: 'Student Lane',
	email: 'lane@example.edu',
	first_login: false,
	role: 'STUDENT' as const,
	role_id: 10030001,
	role_details: 'Software Engineering',
};

const courses = [
	{
		course_id: 10,
		course_code: 'CMSC495',
		title: 'Current Trends and Projects in Computer Science',
		description: 'Capstone course',
		credits: 3,
		subject: 'CMSC',
	},
	{
		course_id: 11,
		course_code: 'CMSC350',
		title: 'Data Structures',
		description: 'Algorithms and structures',
		credits: 3,
		subject: 'CMSC',
	},
	{
		course_id: 12,
		course_code: 'MATH210',
		title: 'Discrete Mathematics',
		description: 'Logic and proofs',
		credits: 3,
		subject: 'MATH',
	},
];

const semesters = [
	{
		semester_id: 20,
		term: 'Fall',
		year: 2026,
	},
];

const sections = [
	{
		section_id: 30,
		capacity: 25,
		enrolled_count: 20,
		seats_available: 5,
		days: 'MWF',
		start_time: '09:00:00',
		end_time: '09:50:00',
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
];

let currentUsers = [adminUser, professorUser, mathProfessorUser, studentUser];
let currentCourses = courses;

describe('AdminConsolePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		currentUsers = [adminUser, professorUser, mathProfessorUser, studentUser];
		currentCourses = [...courses];

		useAuthMock.mockReturnValue({
			user: adminUser,
			updateProfileAction: vi.fn(),
			changePasswordAction: vi.fn(),
			requiresPasswordChange: false,
		});

		listUsersMock.mockImplementation(async (query?: { role?: string }) => ({
			User: (query?.role === 'PROFESSOR' ? currentUsers.filter((entry) => entry.role === 'PROFESSOR') : currentUsers).map((User) => ({ User })),
			Meta: { page: 1, limit: 100, total: currentUsers.length, totalPages: 1 },
		}));
		listCoursesMock.mockImplementation(async () => ({
			Course: currentCourses.map((Course) => ({ Course })),
			Meta: { page: 1, limit: 100, total: currentCourses.length, totalPages: 1 },
		}));
		listSemestersMock.mockResolvedValue(semesters.map((Semester) => ({ Semester })));
		listSectionsMock.mockResolvedValue({
			Section: sections.map((Section) => ({ Section })),
			Meta: { page: 1, limit: 100, total: sections.length, totalPages: 1 },
		});
		listPrerequisitesMock.mockResolvedValue([{ Prerequisite: { courseId: 11, courseCode: 'CMSC350', title: 'Data Structures' } }]);
		createUserMock.mockResolvedValue({ User: studentUser });
		updateUserRoleMock.mockResolvedValue({ User: professorUser });
		createCourseMock.mockResolvedValue({ Course: courses[0] });
		updateCourseMock.mockResolvedValue(courses[0]);
		createSemesterMock.mockResolvedValue({ Semester: semesters[0] });
		createSectionMock.mockResolvedValue({ Section: sections[0] });
		deleteCourseMock.mockResolvedValue(undefined);
		deleteSemesterMock.mockResolvedValue(undefined);
		deleteSectionMock.mockResolvedValue(undefined);
		deleteUserMock.mockResolvedValue(undefined);
		createPrerequisiteMock.mockResolvedValue({ Prerequisite: { courseId: 11, courseCode: 'CMSC350', title: 'Data Structures' } });
		deletePrerequisiteMock.mockResolvedValue(undefined);
	});

	it.each([
		['home overview', '/console/admin', 'Admin Home'],
		['users tools', '/console/admin?tool=users', 'Create User'],
		['courses tools', '/console/admin?tool=courses', 'Create Course'],
		['prerequisites tools', '/console/admin?tool=prerequisites', 'Manage Prerequisites'],
		['semesters tools', '/console/admin?tool=semesters', 'Create Semester'],
		['sections tools', '/console/admin?tool=sections', 'Create Section'],
	] as Array<[string, string, string]>)('renders the %s route and heading', async (_label, path, heading) => {
		renderAdminRoute(path);

		expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
	});

	it('creates a user and shows a local success message', async () => {
		const user = userEvent.setup();
		createUserMock.mockImplementationOnce(async () => {
			const createdUser = {
				id: 5,
				name: 'New Student',
				email: 'new.student@example.edu',
				first_login: true,
				role: 'STUDENT' as const,
				role_id: 10030003,
				role_details: 'Cybersecurity',
			};
			currentUsers = [...currentUsers, createdUser];
			return { User: createdUser };
		});
		renderAdminRoute('/console/admin?tool=users');

		const createHeading = await screen.findByRole('heading', { name: 'Create User' });
		const createPanel = createHeading.closest('section') as HTMLElement;
		const scope = within(createPanel);
		await user.type(scope.getByLabelText(/^Name/), 'New Student');
		await user.type(scope.getByLabelText(/^Email/), 'new.student@example.edu');
		await user.type(scope.getByLabelText(/^Major/), 'Cybersecurity');
		await user.click(scope.getByRole('button', { name: 'Create User' }));

		await waitFor(() => {
			expect(createUserMock).toHaveBeenCalledWith({
				name: 'New Student',
				email: 'new.student@example.edu',
				type: 'STUDENT',
				detail: 'Cybersecurity',
			});
		});

		expect(await scope.findByText('User created successfully.')).toBeInTheDocument();
		expect(await screen.findByText('New Student')).toBeInTheDocument();
	});

	it('surfaces duplicate user creation errors inline', async () => {
		const user = userEvent.setup();
		createUserMock.mockRejectedValueOnce(new Error('A user with that email already exists.'));
		renderAdminRoute('/console/admin?tool=users');

		const createHeading = await screen.findByRole('heading', { name: 'Create User' });
		const createPanel = createHeading.closest('section') as HTMLElement;
		const scope = within(createPanel);
		await user.type(scope.getByLabelText(/^Name/), 'Duplicate Student');
		await user.type(scope.getByLabelText(/^Email/), 'lane@example.edu');
		await user.type(scope.getByLabelText(/^Major/), 'Software Engineering');
		await user.click(scope.getByRole('button', { name: 'Create User' }));

		expect(await scope.findByText('A user with that email already exists.')).toBeInTheDocument();
	});

	it('updates a user role and shows success on that user card', async () => {
		const user = userEvent.setup();
		updateUserRoleMock.mockImplementationOnce(async () => {
			currentUsers = [
				adminUser,
				professorUser,
				mathProfessorUser,
				{
					...studentUser,
					role: 'PROFESSOR',
					role_details: 'Mathematics',
				},
			];
			return { User: currentUsers[2] };
		});
		renderAdminRoute('/console/admin?tool=users');

		const card = await screen.findByText('Student Lane');
		const article = card.closest('article');
		expect(article).not.toBeNull();

		const scope = within(article as HTMLElement);
		await user.selectOptions(scope.getByLabelText(/^Role/), 'PROFESSOR');
		await user.clear(scope.getByLabelText(/^Department/));
		await user.type(scope.getByLabelText(/^Department/), 'Mathematics');
		await user.click(scope.getByRole('button', { name: 'Save Role' }));

		await waitFor(() => {
			expect(updateUserRoleMock).toHaveBeenCalledWith(3, {
				type: 'PROFESSOR',
				detail: 'Mathematics',
			});
		});

		await waitFor(() => {
			expect(screen.getByText("Updated Student Lane's role successfully.")).toBeInTheDocument();
		});
	});

	it('creates a course and shows a workflow-local success message', async () => {
		const user = userEvent.setup();
		createCourseMock.mockImplementationOnce(async () => {
			const createdCourse = {
				course_id: 12,
				course_code: 'CMSC430',
				title: 'Compiler Theory',
				description: 'Compiler construction',
				credits: 4,
				subject: 'CMSC',
			};
			currentCourses = [...currentCourses, createdCourse];
			return createdCourse;
		});
		renderAdminRoute('/console/admin?tool=courses');

		const createHeading = await screen.findByRole('heading', { name: 'Create Course' });
		const createPanel = createHeading.closest('section') as HTMLElement;
		const scope = within(createPanel);
		await user.type(scope.getByLabelText(/^Course Code/), 'cmsc430');
		await user.type(scope.getByLabelText(/^Title/), 'Compiler Theory');
		await user.type(scope.getByLabelText(/^Description/), 'Compiler construction');
		await user.clear(scope.getByLabelText(/^Credits/));
		await user.type(scope.getByLabelText(/^Credits/), '4');
		await user.click(scope.getByRole('button', { name: 'Create Course' }));

		await waitFor(() => {
			expect(createCourseMock).toHaveBeenCalledWith({
				code: 'CMSC430',
				title: 'Compiler Theory',
				desc: 'Compiler construction',
				cred: 4,
			});
		});

		expect(await scope.findByText('Course created successfully.')).toBeInTheDocument();
		expect(await screen.findByText(/CMSC430 • Compiler Theory/)).toBeInTheDocument();
	});

	it('keeps the users tool tab in admin tools instead of falling back to admin home', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=courses');

		await screen.findByRole('heading', { name: 'Create Course' });
		await user.click(screen.getByRole('button', { name: 'Users' }));

		expect(await screen.findByRole('heading', { name: 'Create User' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Admin Tools' })).toBeInTheDocument();
	});

	it('shows edited course details immediately after saving', async () => {
		const user = userEvent.setup();
		updateCourseMock.mockImplementationOnce(async () => {
			const updatedCourse = {
				...currentCourses[0],
				title: 'Advanced Capstone Studio',
				description: 'Updated capstone course',
			};
			currentCourses = [updatedCourse, currentCourses[1]];
			return updatedCourse;
		});
		renderAdminRoute('/console/admin?tool=courses');

		await screen.findByRole('heading', { name: 'Create Course' });
		await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
		await user.clear(screen.getByLabelText(/^Title/));
		await user.type(screen.getByLabelText(/^Title/), 'Advanced Capstone Studio');
		await user.clear(screen.getByLabelText(/^Description/));
		await user.type(screen.getByLabelText(/^Description/), 'Updated capstone course');
		await user.click(screen.getByRole('button', { name: 'Save Course' }));

		await waitFor(() => {
			expect(updateCourseMock).toHaveBeenCalledWith(10, {
				code: 'CMSC495',
				title: 'Advanced Capstone Studio',
				desc: 'Updated capstone course',
				cred: 3,
			});
		});

		expect(await screen.findByText(/CMSC495 • Advanced Capstone Studio/)).toBeInTheDocument();
	});

	it('shows dependency-blocked delete errors for courses', async () => {
		const user = userEvent.setup();
		deleteCourseMock.mockRejectedValueOnce(new Error('Cannot delete course with dependent sections.'));
		renderAdminRoute('/console/admin?tool=courses');

		await screen.findByRole('heading', { name: 'Create Course' });
		await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

		expect(await screen.findByText('Cannot delete course with dependent sections.')).toBeInTheDocument();
	});

	it('surfaces prerequisite cycle errors in the prerequisite workflow', async () => {
		const user = userEvent.setup();
		createPrerequisiteMock.mockRejectedValueOnce(new Error('Adding this prerequisite would create a cycle.'));
		renderAdminRoute('/console/admin?tool=prerequisites');

		await screen.findByText('Manage Prerequisites');
		await user.selectOptions(screen.getByLabelText(/^Add Prerequisite/), '11');
		await user.click(screen.getByRole('button', { name: 'Add Prerequisite' }));

		expect(await screen.findByText('Adding this prerequisite would create a cycle.')).toBeInTheDocument();
	});

	it('creates a semester and shows local success feedback', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=semesters');

		const createHeading = await screen.findByRole('heading', { name: 'Create Semester' });
		const createPanel = createHeading.closest('section') as HTMLElement;
		const scope = within(createPanel);
		await user.selectOptions(scope.getByLabelText(/^Term/), 'Spring');
		await user.clear(scope.getByLabelText(/^Year/));
		await user.type(scope.getByLabelText(/^Year/), '2027');
		await user.click(scope.getByRole('button', { name: 'Create Semester' }));

		await waitFor(() => {
			expect(createSemesterMock).toHaveBeenCalledWith({
				term: 'Spring',
				year: 2027,
			});
		});

		expect(await scope.findByText('Semester created successfully.')).toBeInTheDocument();
	});

	it('limits semester term choices to Fall, Spring, and Summer', async () => {
		renderAdminRoute('/console/admin?tool=semesters');

		await screen.findByRole('heading', { name: 'Create Semester' });
		const termSelect = screen.getByLabelText(/^Term/);
		expect(within(termSelect).getByRole('option', { name: 'Fall' })).toBeInTheDocument();
		expect(within(termSelect).getByRole('option', { name: 'Spring' })).toBeInTheDocument();
		expect(within(termSelect).getByRole('option', { name: 'Summer' })).toBeInTheDocument();
		expect(within(termSelect).queryByRole('option', { name: 'Winter' })).not.toBeInTheDocument();
	});

	it('shows dependency-blocked delete errors for semesters', async () => {
		const user = userEvent.setup();
		deleteSemesterMock.mockRejectedValueOnce(new Error('Cannot delete semester with scheduled sections.'));
		renderAdminRoute('/console/admin?tool=semesters');

		await screen.findByRole('heading', { name: 'Create Semester' });
		await user.click(screen.getByRole('button', { name: 'Delete' }));

		expect(await screen.findByText('Cannot delete semester with scheduled sections.')).toBeInTheDocument();
	});

	it('shows inline role-update validation errors on the user card', async () => {
		const user = userEvent.setup();
		updateUserRoleMock.mockRejectedValueOnce(new Error('Role detail cannot be empty.'));
		renderAdminRoute('/console/admin?tool=users');

		const card = await screen.findByText('Student Lane');
		const article = card.closest('article') as HTMLElement;
		const scope = within(article);

		await user.clear(scope.getByLabelText(/^Major/));
		await user.click(scope.getByRole('button', { name: 'Save Role' }));

		expect(await scope.findByText('Role detail cannot be empty.')).toBeInTheDocument();
	});

	it('requires typing confirm before deleting a user', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=users');

		await screen.findByRole('heading', { name: 'Create User' });
		await user.click(screen.getAllByRole('button', { name: 'Delete User' })[0]);

		const dialog = await screen.findByRole('dialog');
		await user.type(within(dialog).getByLabelText('Type "confirm"'), 'wrong');
		await user.click(within(dialog).getByRole('button', { name: 'Delete User' }));

		expect(await within(dialog).findByText('Type "confirm" to delete this user.')).toBeInTheDocument();
		expect(deleteUserMock).not.toHaveBeenCalled();
		expect(screen.getByText('Admin Runner')).toBeInTheDocument();
	});

	it('deletes a user after confirmation and removes the card immediately', async () => {
		const user = userEvent.setup();
		deleteUserMock.mockImplementationOnce(async (id: number) => {
			currentUsers = currentUsers.filter((entry) => entry.id !== id);
		});
		renderAdminRoute('/console/admin?tool=users');

		await screen.findByRole('heading', { name: 'Create User' });
		await user.click(screen.getAllByRole('button', { name: 'Delete User' })[3]);

		const dialog = await screen.findByRole('dialog');
		await user.type(within(dialog).getByLabelText('Type "confirm"'), 'confirm');
		await user.click(within(dialog).getByRole('button', { name: 'Delete User' }));

		await waitFor(() => {
			expect(deleteUserMock).toHaveBeenCalledWith(3);
		});
		await waitFor(() => {
			expect(screen.queryByText('Student Lane')).not.toBeInTheDocument();
		});
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('keeps the delete dialog open while the removal request is still running', async () => {
		const user = userEvent.setup();
		let resolveDelete: (() => void) | undefined;
		deleteUserMock.mockImplementationOnce(
			() =>
				new Promise<void>((resolve) => {
					resolveDelete = () => {
						currentUsers = currentUsers.filter((entry) => entry.id !== 3);
						resolve();
					};
				})
		);
		renderAdminRoute('/console/admin?tool=users');

		await screen.findByRole('heading', { name: 'Create User' });
		await user.click(screen.getAllByRole('button', { name: 'Delete User' })[3]);

		const dialog = await screen.findByRole('dialog');
		await user.type(within(dialog).getByLabelText('Type "confirm"'), 'confirm');
		await user.click(within(dialog).getByRole('button', { name: 'Delete User' }));

		expect(await within(dialog).findByRole('button', { name: 'Deleting...' })).toBeDisabled();
		expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
		expect(screen.getByText('Student Lane')).toBeInTheDocument();

		resolveDelete?.();

		await waitFor(() => {
			expect(screen.queryByText('Student Lane')).not.toBeInTheDocument();
		});
	});

	it('shows successful prerequisite removal feedback', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=prerequisites');

		await screen.findByRole('heading', { name: 'Manage Prerequisites' });
		await user.click(await screen.findByRole('button', { name: 'Delete Relationship' }));

		await waitFor(() => {
			expect(deletePrerequisiteMock).toHaveBeenCalledWith(10, 11);
		});
		expect(await screen.findByText('CMSC350 removed successfully.')).toBeInTheDocument();
	});

	it('creates a section and shows local success feedback', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=sections');

		const createHeading = await screen.findByRole('heading', { name: 'Create Section' });
		const createPanel = createHeading.closest('section') as HTMLElement;
		const scope = within(createPanel);
		await user.selectOptions(scope.getByLabelText(/^Course/), '10');
		await user.selectOptions(scope.getByLabelText(/^Semester/), '20');
		await user.selectOptions(scope.getByLabelText(/^Professor/), '50020001');
		await user.clear(scope.getByLabelText(/^Capacity/));
		await user.type(scope.getByLabelText(/^Capacity/), '28');
		await user.click(scope.getByLabelText('Tue'));
		await user.click(scope.getByLabelText('Thu'));
		await user.type(scope.getByLabelText('Start Time'), '13:00');
		await user.type(scope.getByLabelText('End Time'), '14:15');
		await user.click(scope.getByRole('button', { name: 'Create Section' }));

		await waitFor(() => {
			expect(createSectionMock).toHaveBeenCalledWith(10, {
				semId: 20,
				profId: 50020001,
				capacity: 28,
				days: 'TR',
				startTm: '13:00:00',
				endTm: '14:15:00',
			});
		});

		expect(await scope.findByText('Section created successfully.')).toBeInTheDocument();
	});

	it('filters professors by the selected course department', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=sections');

		const createHeading = await screen.findByRole('heading', { name: 'Create Section' });
		const scope = within(createHeading.closest('section') as HTMLElement);

		expect(within(scope.getByLabelText(/^Professor/)).queryByRole('option', { name: /Prof Parker/ })).not.toBeInTheDocument();
		await user.selectOptions(scope.getByLabelText(/^Course/), '10');
		expect(within(scope.getByLabelText(/^Professor/)).getByRole('option', { name: /Prof Parker • Computer Science/ })).toBeInTheDocument();
		expect(within(scope.getByLabelText(/^Professor/)).queryByRole('option', { name: /Prof Newton/ })).not.toBeInTheDocument();

		await user.selectOptions(scope.getByLabelText(/^Course/), '12');
		expect(within(scope.getByLabelText(/^Professor/)).getByRole('option', { name: /Prof Newton • Mathematics/ })).toBeInTheDocument();
		expect(within(scope.getByLabelText(/^Professor/)).queryByRole('option', { name: /Prof Parker/ })).not.toBeInTheDocument();
	});

	it('supports asynchronous section creation by disabling other day and time controls', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=sections');

		const createHeading = await screen.findByRole('heading', { name: 'Create Section' });
		const scope = within(createHeading.closest('section') as HTMLElement);
		await user.selectOptions(scope.getByLabelText(/^Course/), '10');
		await user.selectOptions(scope.getByLabelText(/^Semester/), '20');
		await user.selectOptions(scope.getByLabelText(/^Professor/), '50020001');
		await user.click(scope.getByLabelText('Async'));

		expect(scope.getByLabelText('Tue')).toBeDisabled();
		expect(scope.getByLabelText('Start Time')).toBeDisabled();
		expect(scope.getByLabelText('End Time')).toBeDisabled();

		await user.click(scope.getByRole('button', { name: 'Create Section' }));

		await waitFor(() => {
			expect(createSectionMock).toHaveBeenCalledWith(10, {
				semId: 20,
				profId: 50020001,
				capacity: 25,
				days: 'async',
				startTm: undefined,
				endTm: undefined,
			});
		});
	});

	it('hydrates scheduled sections into checkbox and time controls when editing', async () => {
		const user = userEvent.setup();
		renderAdminRoute('/console/admin?tool=sections');

		await screen.findByRole('heading', { name: 'Create Section' });
		await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);

		expect(screen.getByLabelText('Mon')).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByLabelText('Wed')).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByLabelText('Fri')).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByLabelText('Start Time')).toHaveValue('09:00');
		expect(screen.getByText('Mon / Wed / Fri')).toBeInTheDocument();
	});

	it('does not render required-field asterisks in admin tools', async () => {
		renderAdminRoute('/console/admin?tool=sections');

		await screen.findByRole('heading', { name: 'Create Section' });
		expect(screen.queryByText('Course *')).not.toBeInTheDocument();
		expect(screen.queryByText('Semester *')).not.toBeInTheDocument();
		expect(screen.queryByText('Professor *')).not.toBeInTheDocument();
		expect(screen.queryByText('Capacity *')).not.toBeInTheDocument();
		expect(screen.queryByText('Meeting Days *')).not.toBeInTheDocument();
	});

	it('shows section capacity validation failures inline', async () => {
		const user = userEvent.setup();
		createSectionMock.mockRejectedValueOnce(new Error('Capacity must be greater than or equal to enrolled students.'));
		renderAdminRoute('/console/admin?tool=sections');

		await screen.findByRole('heading', { name: 'Create Section' });
		await user.selectOptions(screen.getByLabelText(/^Course/), '10');
		await user.selectOptions(screen.getByLabelText(/^Semester/), '20');
		await user.selectOptions(screen.getByLabelText(/^Professor/), '50020001');
		await user.clear(screen.getByLabelText(/^Capacity/));
		await user.type(screen.getByLabelText(/^Capacity/), '1');
		await user.click(screen.getByLabelText('Mon'));
		await user.type(screen.getByLabelText('Start Time'), '09:00');
		await user.type(screen.getByLabelText('End Time'), '10:00');
		await user.click(screen.getByRole('button', { name: 'Create Section' }));

		expect(await screen.findByText('Capacity must be greater than or equal to enrolled students.')).toBeInTheDocument();
	});

	it('shows dependency-blocked delete errors for sections', async () => {
		const user = userEvent.setup();
		deleteSectionMock.mockRejectedValueOnce(new Error('Cannot delete a section that has enrollments. Remove or archive its enrollments first.'));
		renderAdminRoute('/console/admin?tool=sections');

		await screen.findByRole('heading', { name: 'Create Section' });
		await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

		expect(await screen.findByText('Cannot delete a section that has enrollments. Remove or archive its enrollments first.')).toBeInTheDocument();
	});
});

function renderAdminRoute(path: string) {
	const routePath = '/console/admin';
	const area = path.includes('?tool=') ? 'tools' : 'home';
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path={routePath} element={<AdminConsolePage area={area} />} />
			</Routes>
		</MemoryRouter>
	);
}
