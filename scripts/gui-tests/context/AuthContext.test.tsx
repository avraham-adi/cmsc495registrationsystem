import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../../frontend/src/context/AuthContext';
import { ApiError } from '../../../frontend/src/api/client';

const { getUserMock, loginMock, logoutMock, updPasswordMock, updUserMock } = vi.hoisted(() => ({
	getUserMock: vi.fn(),
	loginMock: vi.fn(),
	logoutMock: vi.fn(),
	updPasswordMock: vi.fn(),
	updUserMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/auth', () => ({
	getUser: getUserMock,
	login: loginMock,
	logout: logoutMock,
	updPassword: updPasswordMock,
	updUser: updUserMock,
}));

const authUser = {
	id: 1,
	name: 'Auth User',
	email: 'auth@example.edu',
	first_login: false,
	role: 'ADMIN' as const,
	role_id: 9001,
	role_details: 'Registrar',
};

describe('AuthContext', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('boots with the current user when session bootstrap succeeds', async () => {
		getUserMock.mockResolvedValue({ User: authUser });
		renderWithProvider();
		expect(await screen.findByText('user:Auth User')).toBeInTheDocument();
	});

	it('boots unauthenticated on 401 responses', async () => {
		getUserMock.mockRejectedValue(new ApiError(401, { error: 'Unauthenticated' }));
		renderWithProvider();
		expect(await screen.findByText('user:none')).toBeInTheDocument();
	});

	it('logs in and updates the exposed auth state', async () => {
		const user = userEvent.setup();
		getUserMock.mockRejectedValue(new ApiError(401, { error: 'Unauthenticated' }));
		loginMock.mockResolvedValue({ User: authUser });

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'login' }));

		expect(await screen.findByText('user:Auth User')).toBeInTheDocument();
		expect(screen.getByText('authenticated:true')).toBeInTheDocument();
	});

	it('clears the user on logout even if the API call rejects', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValue({ User: authUser });
		logoutMock.mockRejectedValue(new Error('network'));

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'logout' }));

		expect(await screen.findByText('user:none')).toBeInTheDocument();
	});

	it('refreshes the current user from the API', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValueOnce({ User: authUser }).mockResolvedValueOnce({ User: { ...authUser, name: 'Refreshed User' } });

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'refresh' }));

		expect(await screen.findByText('user:Refreshed User')).toBeInTheDocument();
	});

	it('returns null from refreshUser on 401 and clears auth state', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValueOnce({ User: authUser }).mockRejectedValueOnce(new ApiError(401, { error: 'Unauthenticated' }));

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'refresh' }));

		expect(await screen.findByText('lastRefresh:null')).toBeInTheDocument();
		expect(screen.getByText('user:none')).toBeInTheDocument();
	});

	it('updates the current profile through updateProfileAction', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValue({ User: authUser });
		updUserMock.mockResolvedValue({ User: { ...authUser, name: 'Updated User' } });

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'update-profile' }));

		expect(await screen.findByText('user:Updated User')).toBeInTheDocument();
	});

	it('changes password and refreshes the user afterward', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValueOnce({ User: { ...authUser, first_login: true } }).mockResolvedValueOnce({ User: authUser });
		updPasswordMock.mockResolvedValue({});

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'change-password' }));

		expect(await screen.findByText('requiresPasswordChange:false')).toBeInTheDocument();
	});

	it('throws when password change succeeds but session refresh returns null', async () => {
		const user = userEvent.setup();
		getUserMock.mockResolvedValueOnce({ User: { ...authUser, first_login: true } }).mockRejectedValueOnce(new ApiError(401, { error: 'Unauthenticated' }));
		updPasswordMock.mockResolvedValue({});

		renderWithProvider();
		await user.click(await screen.findByRole('button', { name: 'change-password' }));

		expect(await screen.findByText('error:Session refresh failed after password update.')).toBeInTheDocument();
	});

	it('supports concurrent refresh calls without corrupting the final user state', async () => {
		const user = userEvent.setup();
		let call = 0;
		getUserMock.mockImplementation(() => {
			call += 1;
			if (call === 1) {
				return Promise.resolve({ User: authUser });
			}
			if (call === 2) {
				return new Promise((resolve) => setTimeout(() => resolve({ User: { ...authUser, name: 'Slow Refresh' } }), 20));
			}
			return Promise.resolve({ User: { ...authUser, name: 'Fast Refresh' } });
		});

		renderWithProvider();
		await screen.findByText('user:Auth User');
		await Promise.all([user.click(screen.getByRole('button', { name: 'refresh' })), user.click(screen.getByRole('button', { name: 'refresh' }))]);

		await waitFor(() => {
			expect(screen.getByText(/user:(Slow Refresh|Fast Refresh)/)).toBeInTheDocument();
		});
	});

	it('throws when useAuth is called outside the provider', () => {
		expect(() => render(<OrphanConsumer />)).toThrow('useAuth must be used within AuthProvider');
	});
});

function AuthConsumer() {
	const { user, isAuthenticated, requiresPasswordChange, loginAction, logoutAction, refreshUser, updateProfileAction, changePasswordAction } = useAuth();
	const [lastRefresh, setLastRefresh] = React.useState('none');
	const [error, setError] = React.useState('');

	async function runRefresh() {
		try {
			const next = await refreshUser();
			setLastRefresh(next?.name ?? 'null');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'unknown');
		}
	}

	async function runChangePassword() {
		try {
			await changePasswordAction({ password: 'Password123!' });
		} catch (err) {
			setError(err instanceof Error ? err.message : 'unknown');
		}
	}

	return (
		<div>
			<div>{`user:${user?.name ?? 'none'}`}</div>
			<div>{`authenticated:${String(isAuthenticated)}`}</div>
			<div>{`requiresPasswordChange:${String(requiresPasswordChange)}`}</div>
			<div>{`lastRefresh:${lastRefresh}`}</div>
			<div>{`error:${error}`}</div>
			<button type="button" onClick={() => void loginAction({ email: 'auth@example.edu', password: 'Password123!' })}>
				login
			</button>
			<button type="button" onClick={() => void logoutAction()}>
				logout
			</button>
			<button type="button" onClick={() => void runRefresh()}>
				refresh
			</button>
			<button type="button" onClick={() => void updateProfileAction({ name: 'Updated User', email: 'updated@example.edu' })}>
				update-profile
			</button>
			<button type="button" onClick={() => void runChangePassword()}>
				change-password
			</button>
		</div>
	);
}

function OrphanConsumer() {
	useAuth();
	return null;
}

function renderWithProvider() {
	return render(
		<AuthProvider>
			<AuthConsumer />
		</AuthProvider>
	);
}
