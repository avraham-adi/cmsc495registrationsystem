/*
Adi Avraham
CMSC495 Group Golf Capstone Project
ProfilePage.tsx
input
authenticated user state and editable profile form values
output
role-aware profile routing and profile update UI feedback
description
Renders the standalone profile screen and redirects role-based users into their integrated profile workflows.
*/

import { useEffect, useState, type SubmitEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { useFormFeedback } from '../lib/useFormFeedback';

export function ProfilePage() {
	const { updateProfileAction, user, requiresPasswordChange } = useAuth();
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const feedback = useFormFeedback();
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		setName(user?.name ?? '');
		setEmail(user?.email ?? '');
	}, [user?.email, user?.name]);

	if (user?.role === 'STUDENT') {
		return <Navigate to="/?view=profile" replace />;
	}

	if (user?.role === 'PROFESSOR') {
		return <Navigate to="/?view=profile" replace />;
	}

	if (user?.role === 'ADMIN') {
		return <Navigate to="/console/admin?view=profile" replace />;
	}

	// Saves the standalone profile form and surfaces backend validation messages.
	async function submit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		feedback.reset();

		try {
			await updateProfileAction({ name, email });
			feedback.setSuccess('Profile updated successfully.');
		} catch (err) {
			feedback.setErrorFromUnknown(err, 'Unable to update profile right now.');
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
				<FormField id="profile-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />

				{feedback.feedback.message ? <StatusMessage kind="success" message={feedback.feedback.message} /> : null}
				{feedback.feedback.error ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}

				<button type="submit" className="primary-button" disabled={isSubmitting || requiresPasswordChange}>
					{isSubmitting ? 'Saving...' : 'Save Profile'}
				</button>
			</form>
		</section>
	);
}
