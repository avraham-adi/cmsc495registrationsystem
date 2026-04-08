import { useState, type SubmitEvent } from 'react';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

export function ChangePasswordPage() {
	const { changePasswordAction, requiresPasswordChange } = useAuth();
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage('');
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setIsSubmitting(true);

		try {
			await changePasswordAction({ password });
			setPassword('');
			setConfirmPassword('');
			setMessage('Password updated successfully.');
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError('Unable to change password right now.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="panel">
			<div className="panel-header">
				<div>
					<p className="eyebrow">Authentication</p>
					<h2>Change Password</h2>
				</div>
			</div>

			{requiresPasswordChange ? (
				<StatusMessage
					kind="info"
					message="The backend marks this account as first-login. Change your password to unlock the rest of the protected routes."
				/>
			) : null}

			<form className="stack" onSubmit={submit}>
				<FormField
					id="new-password"
					label="New Password"
					type="password"
					value={password}
					onChange={setPassword}
					autoComplete="new-password"
					required
				/>
				<FormField
					id="confirm-password"
					label="Confirm Password"
					type="password"
					value={confirmPassword}
					onChange={setConfirmPassword}
					autoComplete="new-password"
					required
				/>

				<p className="hint">
					Backend password policy requires at least 8 characters, upper/lowercase, a number, a special
					character, and it cannot contain the email local-part.
				</p>

				{message ? <StatusMessage kind="success" message={message} /> : null}
				{error ? <StatusMessage kind="error" message={error} /> : null}

				<button type="submit" className="primary-button" disabled={isSubmitting}>
					{isSubmitting ? 'Updating...' : 'Update Password'}
				</button>
			</form>
		</section>
	);
}
