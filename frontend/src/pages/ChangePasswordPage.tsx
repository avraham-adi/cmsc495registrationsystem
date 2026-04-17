/*
Adi Avraham
CMSC495 Group Golf Capstone Project
ChangePasswordPage.tsx
input
authenticated user state and editable password form values
output
role-aware password routing and password update UI feedback
description
Renders the standalone password screen and redirects role-based users into their integrated password workflows.
*/

import { useState, type SubmitEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormFeedback } from '../lib/useFormFeedback';

export function ChangePasswordPage() {
	const { changePasswordAction, requiresPasswordChange, user } = useAuth();
	const navigate = useNavigate();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const feedback = useFormFeedback();
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	// Updates the current password and routes the user into the correct role home after success.
	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		feedback.reset();
		const wasFirstLogin = requiresPasswordChange;

		if (password !== confirmPassword) {
			feedback.setError('Passwords do not match.');
			return;
		}

		setIsSubmitting(true);

		try {
			const refreshedUser = await changePasswordAction({ password });
			setPassword('');
			setConfirmPassword('');
			feedback.setSuccess('Password updated successfully.');
			const nextPath = refreshedUser.role === 'ADMIN' ? '/console/admin' : '/';

			if (wasFirstLogin) {
				if (window.location.pathname === nextPath) {
					window.location.reload();
				} else {
					window.location.assign(nextPath);
				}
				return;
			}

			navigate(nextPath, { replace: true });
			return;
		} catch (err) {
			feedback.setErrorFromUnknown(err, 'Unable to change password right now.');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="auth-layout">
			<section className="auth-card auth-card-wide">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Authentication</p>
						<h1>Change Password</h1>
					</div>
				</div>

				{requiresPasswordChange ? (
					<StatusMessage kind="info" message="It appears to be your first time logging in. Password change is required before other workflows become available." />
				) : null}

				<form className="stack" onSubmit={submit}>
					<FormField id="new-password" label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
					<FormField id="confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required />

					<p className="hint">
						Password requires:
						<br /> - at least 8 characters
						<br /> - 1 upper/lowercase
						<br /> - 1 number
						<br /> - 1 special character
						<br /> - cannot contain the email address
					</p>

					{feedback.feedback.message ? <StatusMessage kind="success" message={feedback.feedback.message} /> : null}
					{feedback.feedback.error ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}

					<button type="submit" className="primary-button" disabled={isSubmitting}>
						{isSubmitting ? 'Updating...' : 'Update Password'}
					</button>
				</form>
			</section>
		</div>
	);
}
