import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../../../frontend/src/pages/DashboardPage';

const { useAuthMock, mockNavigate } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	mockNavigate: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext.tsx', () => ({
	useAuth: useAuthMock,
}));

vi.mock('../../../frontend/src/lib/studentEnrollment.ts', () => ({
	loadStudentEnrollmentData: vi.fn().mockResolvedValue({
		enrollments: [],
		sections: [],
		semesters: [{ semester_id: 1, term: 'Fall', year: 2026 }],
	}),
	buildEnrichedEnrollments: vi.fn().mockReturnValue([]),
	calculateEnrollmentCredits: vi.fn().mockReturnValue(0),
	groupEnrollmentsBySemester: vi.fn().mockReturnValue([]),
	getCurrentSemester: vi.fn().mockReturnValue({ semester_id: 1, term: 'Fall', year: 2026 }),
	buildWeeklySchedule: vi.fn().mockReturnValue([]),
}));

vi.mock('react-weekview', () => ({
	useWeekView: () => ({
		days: Array.from({ length: 7 }, (_, index) => ({
			name: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
			date: new Date(2026, 3, 13 + index),
			cells: [],
		})),
	}),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('DashboardPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not render a password tab for students', () => {
		useAuthMock.mockReturnValue({
			user: {
				id: 1,
				name: 'Runner Student',
				email: 'runner.student@example.edu',
				first_login: false,
				role: 'STUDENT',
				role_id: 10000001,
				role_details: 'Computer Science',
			},
			requiresPasswordChange: false,
			updateProfileAction: vi.fn(),
		});

		renderDashboard('/');

		expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Password' })).not.toBeInTheDocument();
	});

	it('shows a change-password button inside the profile view', async () => {
		const user = userEvent.setup();

		useAuthMock.mockReturnValue({
			user: {
				id: 1,
				name: 'Runner Student',
				email: 'runner.student@example.edu',
				first_login: false,
				role: 'STUDENT',
				role_id: 10000001,
				role_details: 'Computer Science',
			},
			requiresPasswordChange: false,
			updateProfileAction: vi.fn(),
		});

		renderDashboard('/?view=profile');

		await user.click(screen.getByRole('button', { name: 'Profile' }));
		await user.click(screen.getByRole('button', { name: 'Change Password' }));

		expect(mockNavigate).toHaveBeenCalledWith('/change-password');
	});
});

function renderDashboard(initialEntry: string) {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Routes>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/profile" element={<div>Profile Route</div>} />
			</Routes>
		</MemoryRouter>
	);
}
