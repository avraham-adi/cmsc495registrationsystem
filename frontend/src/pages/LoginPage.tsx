import { useState, type SubmitEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

type LocationState = {
	from?: {
		pathname?: string,
	},
};

export function LoginPage() {
	const { isAuthenticated, loginAction, requiresPasswordChange } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;
	const targetPath = state?.from?.pathname && state.from.pathname !== '/login' ? state.from.pathname : '/profile';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isAuthenticated) {
		return <Navigate to={requiresPasswordChange ? '/change-password' : '/profile'} replace />;
	}

	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setError('');

		try {
			const user = await loginAction({ email, password });
			navigate(user.first_login ? '/change-password' : targetPath, { replace: true });
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError('Unable to log in right now.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="auth-layout">
			<section className="auth-card">
				<p className="eyebrow">Course Registration System</p>
				<h1>Sign in</h1>
				<p className="auth-copy">
					Welcome to the Golf University Course Registration System. Please log in to access system.
				</p>

				<form className="stack" onSubmit={submit}>
					<FormField
						id="email"
						label="Email"
						type="email"
						value={email}
						onChange={setEmail}
						autoComplete="email"
						required
						placeholder="you@example.edu"
					/>
					<FormField
						id="password"
						label="Password"
						type="password"
						value={password}
						onChange={setPassword}
						autoComplete="current-password"
						required
					/>

					{error ? <StatusMessage kind="error" message={error} /> : null}

					<button type="submit" className="primary-button" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</section>
		</div>
	);
}
