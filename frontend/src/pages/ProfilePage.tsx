import { useEffect, useState, type SubmitEvent } from 'react';
import { ApiError } from '../api/client';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
	const { updateProfileAction, user } = useAuth();
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setName(user?.name ?? '');
		setEmail(user?.email ?? '');
	}, [user?.email, user?.name]);

	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setMessage('');
		setError('');

		try {
			await updateProfileAction({ name, email });
			setMessage('Profile updated successfully.');
		} catch (err) {
			if (err instanceof ApiError) {
				setError(err.message);
			} else {
				setError('Unable to update profile right now.');
			}
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<section className="panel">
			<div className="panel-header">
				<div>
					<p className="eyebrow">Current User</p>
					<h2>Profile</h2>
				</div>
				<div className="pill-row">
					<span className="pill">{user?.role}</span>
					<span className="pill subtle">{user?.role_details}</span>
				</div>
			</div>

			<form className="stack" onSubmit={submit}>
				<FormField id="name" label="Name" value={name} onChange={setName} required />
				<FormField
					id="profile-email"
					label="Email"
					type="email"
					value={email}
					onChange={setEmail}
					autoComplete="email"
					required
				/>

				<div className="info-grid">
					<div className="info-card">
						<span className="info-label">User ID</span>
						<strong>{user?.id}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Role ID</span>
						<strong>{user?.role_id}</strong>
					</div>
				</div>

				{message ? <StatusMessage kind="success" message={message} /> : null}
				{error ? <StatusMessage kind="error" message={error} /> : null}

				<button type="submit" className="primary-button" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Profile'}
				</button>
			</form>
		</section>
	);
}
