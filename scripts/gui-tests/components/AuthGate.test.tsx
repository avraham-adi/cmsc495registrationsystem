import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthGate } from '../../../frontend/src/components/AuthGate';
import { renderWithRouter } from '../support/test-utils';

const { useAuthMock } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext.tsx', () => ({
	useAuth: useAuthMock,
}));

describe('AuthGate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows a loading state while session bootstrap is in progress', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: true,
			requiresPasswordChange: false,
			user: null,
		});

		renderWithRouter(
			<AuthGate>
				<div>Protected Content</div>
			</AuthGate>
		);

		expect(screen.getByText('Loading session...')).toBeInTheDocument();
	});

	it('redirects unauthenticated users to login', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: false,
			isLoading: false,
			requiresPasswordChange: false,
			user: null,
		});

		renderWithRouter(
			<AuthGate>
				<div>Protected Content</div>
			</AuthGate>
		);

		expect(screen.getByText('Login Route')).toBeInTheDocument();
	});

	it('redirects first-login students away from the root route', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			requiresPasswordChange: true,
			user: { role: 'STUDENT' },
		});

		renderWithRouter(
			<AuthGate>
				<div>Student Dashboard</div>
			</AuthGate>
		);

		expect(screen.getByText('Change Password Route')).toBeInTheDocument();
	});

	it('redirects first-login students away from protected non-root routes', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			requiresPasswordChange: true,
			user: { role: 'STUDENT' },
		});

		renderWithRouter(
			<AuthGate>
				<div>Catalog</div>
			</AuthGate>,
			{ initialEntries: ['/catalog'], path: '/catalog' }
		);

		expect(screen.getByText('Change Password Route')).toBeInTheDocument();
	});

	it('redirects first-login professors away from protected routes', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			requiresPasswordChange: true,
			user: { role: 'PROFESSOR' },
		});

		renderWithRouter(
			<AuthGate>
				<div>Professor Sections</div>
			</AuthGate>,
			{ initialEntries: ['/professor/sections'], path: '/professor/sections' }
		);

		expect(screen.getByText('Change Password Route')).toBeInTheDocument();
	});

	it('lets first-login non-students access the change-password route', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			requiresPasswordChange: true,
			user: { role: 'ADMIN' },
		});

		renderWithRouter(
			<AuthGate>
				<div>Change Password Screen</div>
			</AuthGate>,
			{ initialEntries: ['/change-password'], path: '/change-password' }
		);

		expect(screen.getByText('Change Password Screen')).toBeInTheDocument();
	});
});
