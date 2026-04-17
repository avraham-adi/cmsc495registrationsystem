import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../../../frontend/src/pages/LoginPage';
import { ApiError } from '../../../frontend/src/api/client';
import { render } from '@testing-library/react';

const { useAuthMock, mockNavigate } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
	mockNavigate: vi.fn(),
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

describe('LoginPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('submits credentials and routes first-login students to the password workflow', async () => {
		const user = userEvent.setup();
		const loginAction = vi.fn().mockResolvedValue({
			first_login: true,
			role: 'STUDENT',
		});

		useAuthMock.mockReturnValue({
			isAuthenticated: false,
			loginAction,
			requiresPasswordChange: false,
			user: null,
		});

		renderLoginPage();

		await user.type(screen.getByLabelText('Email'), 'runner.student@example.edu');
		await user.type(screen.getByLabelText('Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Sign In' }));

		expect(loginAction).toHaveBeenCalledWith({
			email: 'runner.student@example.edu',
			password: 'Password123!',
		});

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/change-password', { replace: true });
		});
	});

	it('shows API failures returned during login', async () => {
		const user = userEvent.setup();
		const loginAction = vi.fn().mockRejectedValue(new ApiError(401, { error: 'Invalid email and/or password.' }));

		useAuthMock.mockReturnValue({
			isAuthenticated: false,
			loginAction,
			requiresPasswordChange: false,
			user: null,
		});

		renderLoginPage();

		await user.type(screen.getByLabelText('Email'), 'runner.student@example.edu');
		await user.type(screen.getByLabelText('Password'), 'wrong-password');
		await user.click(screen.getByRole('button', { name: 'Sign In' }));

		expect(await screen.findByText('Invalid email and/or password.')).toBeInTheDocument();
	});

	it('routes first-login professors to the change-password page', async () => {
		const user = userEvent.setup();
		const loginAction = vi.fn().mockResolvedValue({
			first_login: true,
			role: 'PROFESSOR',
		});

		useAuthMock.mockReturnValue({
			isAuthenticated: false,
			loginAction,
			requiresPasswordChange: false,
			user: null,
		});

		renderLoginPage();

		await user.type(screen.getByLabelText('Email'), 'professor@example.edu');
		await user.type(screen.getByLabelText('Password'), 'Password123!');
		await user.click(screen.getByRole('button', { name: 'Sign In' }));

		await waitFor(() => {
			expect(mockNavigate).toHaveBeenCalledWith('/change-password', { replace: true });
		});
	});

	it('routes already-authenticated users back to their requested target path', () => {
		useAuthMock.mockReturnValue({
			isAuthenticated: true,
			loginAction: vi.fn(),
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		render(
			<MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/catalog' } } }]}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/catalog" element={<div>Catalog Route</div>} />
				</Routes>
			</MemoryRouter>
		);

		expect(screen.getByText('Catalog Route')).toBeInTheDocument();
	});
});

function renderLoginPage() {
	return render(
		<MemoryRouter initialEntries={['/login']}>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
			</Routes>
		</MemoryRouter>
	);
}
