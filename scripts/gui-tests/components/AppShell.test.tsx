import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../../../frontend/src/components/AppShell';

const { useAuthMock } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

describe('AppShell', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the student navigation for authenticated students', () => {
		useAuthMock.mockReturnValue({
			logoutAction: vi.fn(),
			requiresPasswordChange: false,
			user: {
				name: 'Runner Student',
				role: 'STUDENT',
				role_id: 10000001,
			},
		});

		renderShell();

		expect(screen.getByText('Course Registration')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Student Home' })).toHaveAttribute('href', '/');
		expect(screen.queryByRole('link', { name: 'Change Password' })).not.toBeInTheDocument();
		expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
		expect(screen.getAllByText('Runner Student')).toHaveLength(2);
	});

	it('renders the admin navigation links for admin home and tools', async () => {
		const user = userEvent.setup();

		useAuthMock.mockReturnValue({
			logoutAction: vi.fn(),
			requiresPasswordChange: false,
			user: {
				name: 'Runner Admin',
				role: 'ADMIN',
				role_id: 90010001,
			},
		});

		render(
			<MemoryRouter initialEntries={['/console/admin']}>
				<Routes>
					<Route path="/" element={<AppShell />}>
						<Route path="console/admin" element={<div>Overview</div>} />
					</Route>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByRole('heading', { name: 'Golf UniversityRegistrationUtility' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Admin Home' })).toHaveAttribute('href', '/console/admin');
		expect(screen.getByRole('link', { name: 'Admin Tools' })).toHaveAttribute('href', '/console/admin?tool=users');

		await user.click(screen.getByRole('link', { name: 'Admin Tools' }));

		expect(screen.getByRole('link', { name: 'Admin Tools' })).toHaveClass('active');
		expect(screen.getByRole('link', { name: 'Admin Home' })).not.toHaveClass('active');
	});

	it('locks student navigation behind first-login password change requirements', () => {
		useAuthMock.mockReturnValue({
			logoutAction: vi.fn(),
			requiresPasswordChange: true,
			user: {
				name: 'Runner Student',
				role: 'STUDENT',
				role_id: 10000001,
			},
		});

		renderShell();

		expect(screen.getByText(/Password update required\./)).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Change Password' })).toHaveAttribute('href', '/change-password');
		expect(screen.getByText('Course Registration')).toHaveAttribute('aria-disabled', 'true');
	});

	it('renders professor navigation for teaching workflows', () => {
		useAuthMock.mockReturnValue({
			logoutAction: vi.fn(),
			requiresPasswordChange: false,
			user: {
				name: 'Professor Lane',
				role: 'PROFESSOR',
				role_id: 50010001,
			},
		});

		render(
			<MemoryRouter initialEntries={['/professor/sections']}>
				<Routes>
					<Route path="/" element={<AppShell />}>
						<Route index element={<div>Professor Home Content</div>} />
						<Route path="professor/sections" element={<div>Teaching Sections</div>} />
					</Route>
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByRole('link', { name: 'Professor Home' })).toHaveAttribute('href', '/');
		expect(screen.queryByRole('link', { name: 'Teaching Sections' })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Change Password' })).not.toBeInTheDocument();
		expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
	});
});

function renderShell() {
	return render(
		<MemoryRouter initialEntries={['/']}>
			<Routes>
				<Route path="/" element={<AppShell />}>
					<Route index element={<div>Dashboard Content</div>} />
				</Route>
			</Routes>
		</MemoryRouter>
	);
}
