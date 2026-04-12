import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../../../frontend/src/pages/ProfilePage';
import { ApiError } from '../../../frontend/src/api/client';

const { useAuthMock } = vi.hoisted(() => ({
	useAuthMock: vi.fn(),
}));

vi.mock('../../../frontend/src/context/AuthContext', () => ({
	useAuth: useAuthMock,
}));

describe('ProfilePage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('redirects students to the dashboard profile workflow', () => {
		useAuthMock.mockReturnValue({
			updateProfileAction: vi.fn(),
			requiresPasswordChange: false,
			user: { role: 'STUDENT' },
		});

		renderPage();

		expect(screen.getByText('Student Profile Route')).toBeInTheDocument();
	});

	it('redirects professors to the integrated professor profile workflow', () => {
		useAuthMock.mockReturnValue({
			updateProfileAction: vi.fn(),
			requiresPasswordChange: false,
			user: { role: 'PROFESSOR', role_details: 'Computer Science', name: 'Prof Parker', email: 'prof@example.edu' },
		});

		renderPage();

		expect(screen.getByText('Student Profile Route')).toBeInTheDocument();
	});

	it('submits updated profile values successfully', async () => {
		const user = userEvent.setup();
		const updateProfileAction = vi.fn().mockResolvedValue({});
		useAuthMock.mockReturnValue({
			updateProfileAction,
			requiresPasswordChange: false,
			user: { role: undefined, role_details: 'Registrar', name: 'Admin User', email: 'admin@example.edu' },
		});

		renderPage();

		await user.clear(screen.getByLabelText('Name'));
		await user.type(screen.getByLabelText('Name'), 'Updated Admin');
		await user.clear(screen.getByLabelText('Email'));
		await user.type(screen.getByLabelText('Email'), 'updated@example.edu');
		await user.click(screen.getByRole('button', { name: 'Save Profile' }));

		await waitFor(() => {
			expect(updateProfileAction).toHaveBeenCalledWith({ name: 'Updated Admin', email: 'updated@example.edu' });
		});
		expect(await screen.findByText('Profile updated successfully.')).toBeInTheDocument();
	});

	it('surfaces backend validation errors', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			updateProfileAction: vi.fn().mockRejectedValue(new ApiError(400, { error: 'Email already in use.' })),
			requiresPasswordChange: false,
			user: { role: undefined, role_details: 'Registrar', name: 'Admin User', email: 'admin@example.edu' },
		});

		renderPage();

		await user.click(screen.getByRole('button', { name: 'Save Profile' }));

		expect(await screen.findByText('Email already in use.')).toBeInTheDocument();
	});

	it('shows a generic error on unexpected failures', async () => {
		const user = userEvent.setup();
		useAuthMock.mockReturnValue({
			updateProfileAction: vi.fn().mockRejectedValue(new Error('boom')),
			requiresPasswordChange: false,
			user: { role: undefined, role_details: 'Registrar', name: 'Admin User', email: 'admin@example.edu' },
		});

		renderPage();

		await user.click(screen.getByRole('button', { name: 'Save Profile' }));

		expect(await screen.findByText('boom')).toBeInTheDocument();
	});

	it('disables profile saves when a password change is still required', () => {
		useAuthMock.mockReturnValue({
			updateProfileAction: vi.fn(),
			requiresPasswordChange: true,
			user: { role: undefined, role_details: 'Registrar', name: 'Admin User', email: 'admin@example.edu' },
		});

		renderPage();

		expect(screen.getByRole('button', { name: 'Save Profile' })).toBeDisabled();
	});
});

function renderPage() {
	return render(
		<MemoryRouter initialEntries={['/profile']}>
			<Routes>
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/" element={<div>Student Profile Route</div>} />
			</Routes>
		</MemoryRouter>
	);
}
