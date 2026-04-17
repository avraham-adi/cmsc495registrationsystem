/*
Adi Avraham
CMSC495 Group Golf Capstone Project
LoginPage.tsx
input
authentication form values and route redirect intent
output
login form UI, auth redirects, and backend error feedback
description
Renders the sign-in workflow and routes authenticated users into the correct role-aware destination.
*/

import { useState, type SubmitEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormFeedback } from '../lib/useFormFeedback';

type LocationState = {
	from?: {
		pathname?: string;
	};
};

export function LoginPage() {
	const { isAuthenticated, loginAction, requiresPasswordChange } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as LocationState | null;
	const targetPath = state?.from?.pathname && state.from.pathname !== '/login' ? state.from.pathname : '/';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const feedback = useFormFeedback();
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (isAuthenticated) {
		if (requiresPasswordChange) {
			return <Navigate to="/change-password" replace />;
		}

		return <Navigate to={targetPath} replace />;
	}

	// Submits credentials and routes the user into the correct post-login workflow.
	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		feedback.reset();

		try {
			const user = await loginAction({ email, password });
			navigate(user.first_login ? '/change-password' : targetPath, { replace: true });
		} catch (err) {
			feedback.setErrorFromUnknown(err, 'Unable to log in right now.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="auth-layout">
			<section className="auth-card">
				<p className="eyebrow">Course Registration System</p>
				<h1>Sign in</h1>
				<p className="auth-copy">Welcome to the course registration system. Sign in to access student, professor, or administrative workflows.</p>

				<form className="stack" onSubmit={submit}>
					<FormField id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required placeholder="you@example.edu" />
					<FormField id="password" label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required />

					{feedback.feedback.error ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}

					<button type="submit" className="primary-button" disabled={isSubmitting}>
						{isSubmitting ? 'Signing in...' : 'Sign In'}
					</button>
				</form>
			</section>
		</div>
	);
}
