import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChangePasswordPage } from '../../../frontend/src/pages/ChangePasswordPage';
import { ApiError } from '../../../frontend/src/api/client';

const { useAuthMock, mockNavigate, assignMock, reloadMock } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	mockNavigate: vi.fn(),
	assignMock: vi.fn(),
	reloadMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('ChangePasswordPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, 'location', {
			configurable: true,
			value: {
				pathname: '/change-password',
				assign: assignMock,
				reload: reloadMock,
			},
		});
	});

	it('renders as a standalone password page for first-login students', () => {
		useAuthMock.mockReturnValue({
			changePasswordAction: vi.fn(),
			requiresPasswordChange: true,
			user: { role: 'STUDENT' },
		});

		renderPage();

		expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
		expect(screen.getByText('It appears to be your first time logging in. Password change is required before other workflows become available.')).toBeInTheDocument();
		expect(screen.queryByText('Dashboard Password Route')).not.toBeInTheDocument();
	});

	it('blocks submission when the confirmation password does not match', async () => {
		const user = userEvent.setup();
		const changePasswordAction = vi.fn();
		useAuthMock.mockReturnValue({
			changePasswordAction,
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		renderPage();

		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123?');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
		expect(changePasswordAction).not.toHaveBeenCalled();
	});

	it('submits and routes students back to the standalone home workflow after success', async () => {
		const user = userEvent.setup();
		const changePasswordAction = vi.fn().mockResolvedValue({ role: 'STUDENT' });
		useAuthMock.mockReturnValue({
			changePasswordAction,
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		renderPage();

		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		await waitFor(() => {
			expect(changePasswordAction).toHaveBeenCalledWith({ password: 'Password123!' });
		});
		expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
	});

	it('navigates the browser back to home after a first-login student password change', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			changePasswordAction: vi.fn().mockResolvedValue({ role: 'STUDENT' }),
			requiresPasswordChange: true,
			user: { role: 'STUDENT' },
		});

		renderPage();

		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		await waitFor(() => {
			expect(assignMock).toHaveBeenCalledWith('/');
		});
	});

	it('shows API error messages returned from the backend', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			changePasswordAction: vi.fn().mockRejectedValue(new ApiError(400, { error: 'Password must include a special character.' })),
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		renderPage();

		await user.type(screen.getByLabelText('New Password'), 'Password123');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		expect(await screen.findByText('Password must include a special character.')).toBeInTheDocument();
	});

	it('shows a generic error for unexpected failures', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			changePasswordAction: vi.fn().mockRejectedValue(new Error('boom')),
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		renderPage();

		await user.type(screen.getByLabelText('New Password'), 'Password123!');
		await user.type(screen.getByLabelText('Confirm Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Update Password' }));

		expect(await screen.findByText('boom')).toBeInTheDocument();
	});
});

function renderPage() {
	return render(
		<MemoryRouter initialEntries={['/change-password']}>
			<Routes>
				<Route path="/change-password" element={<ChangePasswordPage />} />
				<Route path="/" element={<div>Home Route</div>} />
			</Routes>
		</MemoryRouter>
	);
}
