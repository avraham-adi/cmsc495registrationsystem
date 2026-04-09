import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Reads authstate and displays user/session info. Renders the active page via Outlet
export function AppShell() {
	const { logoutAction, requiresPasswordChange, user } = useAuth();
	const navigate = useNavigate();
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const timer = window.setInterval(() => {
			setNow(new Date());
		}, 1000);

		return () => window.clearInterval(timer);
	}, []);

	async function logout() {
		await logoutAction();
		navigate('/login', { replace: true });
	}

	const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'full',
		timeStyle: 'medium',
	}).format(now);

	return (
		<div className="app-frame">
			<aside className="sidebar">
				<div>
					<p className="eyebrow">Group Golf Course Registration System</p>
					<h1>Golf University Registration Utility</h1>
					<p className="sidebar-copy">Session-based React client wired against the OpenAPI-authenticated backend.</p>
				</div>

				<nav className="nav-list" aria-label="Primary">
					<NavLink to="/" end className="nav-item">
						Dashboard
					</NavLink>
					<NavLink to="/profile" end className="nav-item">
						Profile
					</NavLink>
					<NavLink to="/change-password" className="nav-item">
						Change Password
					</NavLink>
					{user?.role === 'STUDENT' ? (
						<>
							<NavLink to="/catalog" end className="nav-item">
								Course Catalog
							</NavLink>
						</>
					) : null}
					{user?.role === 'ADMIN' ? (
						<>
							<NavLink to="/admin/users" end className="nav-item">
								Manage Users
							</NavLink>
						</>
					) : null}
				</nav>

				<div className="sidebar-footer">
					<div>
						<p className="sidebar-user">{user?.name}</p>
						<p className="sidebar-meta">
							{user?.role}
							{requiresPasswordChange ? ' - Password reset required' : ''}
						</p>
					</div>
					<button type="button" className="secondary-button" onClick={logout}>
						Log Out
					</button>
				</div>
			</aside>

			<main className="content">
				{user ? (
					<section className="top-status-bar">
						<div className="top-status-item">
							<span className="info-label">{user.role === 'STUDENT' ? 'Student Name' : 'User Name'} </span>
							<strong>{user.name}</strong>
						</div>
						<div className="top-status-item">
							<span className="info-label">{user.role === 'STUDENT' ? 'Student ID' : 'User ID'} </span>
							<strong>{user.role_id}</strong>
						</div>
						<div className="top-status-item">
							<span className="info-label">Date / Time </span>
							<strong>{formattedTimestamp}</strong>
						</div>
					</section>
				) : null}

				{requiresPasswordChange ? (
					<section className="banner warning persistent-banner">
						<div>
							<strong>Password update required.</strong> Your account is still on first login, and most protected backend routes stay blocked until you change your password.
						</div>
						<NavLink to="/change-password" className="banner-link">
							Change Password
						</NavLink>
					</section>
				) : null}

				<div className="content-body">
					<Outlet />
				</div>
			</main>
		</div>
	);
}

export function AdminOnly({ children }: { children: ReactNode }) {
	const { user } = useAuth();

	if (user?.role !== 'ADMIN') {
		return <Navigate to="/profile" replace />;
	}

	return <>{children}</>;
}

export function StudentOnly({ children }: { children: ReactNode }) {
	const { user } = useAuth();

	if (user?.role !== 'STUDENT') {
		return <Navigate to="/profile" replace />;
	}

	return <>{children}</>;
}
