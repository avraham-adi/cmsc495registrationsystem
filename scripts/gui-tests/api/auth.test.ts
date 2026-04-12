import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getUser, login, logout, updPassword, updUser } from '../../../frontend/src/api/auth';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn(),
}));

vi.mock('../../../frontend/src/api/client.ts', () => ({
	request: requestMock,
}));

describe('auth api', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('logs in with a POST request', () => {
		login({ email: 'a@example.edu', password: 'Password123!' });
		expect(requestMock).toHaveBeenCalledWith('/user/login', {
			method: 'POST',
			body: { email: 'a@example.edu', password: 'Password123!' },
		});
	});

	it('logs out through the logout endpoint', () => {
		logout();
		expect(requestMock).toHaveBeenCalledWith('/user/logout');
	});

	it('reads the authenticated user from /user/me', () => {
		getUser();
		expect(requestMock).toHaveBeenCalledWith('/user/me');
	});

	it('updates the current user with PUT', () => {
		updUser({ name: 'New Name', email: 'new@example.edu' });
		expect(requestMock).toHaveBeenCalledWith('/user/me', {
			method: 'PUT',
			body: { name: 'New Name', email: 'new@example.edu' },
		});
	});

	it('updates the current password with PATCH', () => {
		updPassword({ password: 'Password123!' });
		expect(requestMock).toHaveBeenCalledWith('/user/me', {
			method: 'PATCH',
			body: { password: 'Password123!' },
		});
	});
});
