/*
Adi Avraham
CMSC495 Group Golf Capstone Project
AppShell.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders the shared authenticated layout, role-based navigation, and top status chrome.
*/

import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Locks Navigation items when firstLogin=true
function LockedNavItem({
	to,
	children,
	disabled,
	end = false,
	isActive,
}: {
	to: string;
	children: React.ReactNode;
	disabled: boolean;
	end?: boolean;
	isActive?: (pathname: string, search: string) => boolean;
}) {
	const location = useLocation();

	if (disabled) {
		return (
			<span className="nav-item nav-item-disabled" aria-disabled="true">
				{children}
			</span>
		);
	}

	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive: linkActive }) => {
				const active = isActive ? isActive(location.pathname, location.search) : linkActive;
				return active ? 'nav-item active' : 'nav-item';
			}}
		>
			{children}
		</NavLink>
	);
}

// Reads authstate and displays user/session info. Renders the active page via Outlet
export function AppShell() {
	const { logoutAction, requiresPasswordChange, user } = useAuth();
	const navigate = useNavigate();
	const [now, setNow] = useState(() => new Date());
	const locked = requiresPasswordChange;

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
	const homeLabel = user?.role === 'PROFESSOR' ? 'Professor Home' : 'Student Home';

	return (
		<div className="app-frame">
			<aside className="sidebar">
				<div className="sidebar-brand">
					<p className="eyebrow">GURU</p>
					<h1>
						Golf University
						<br />
						Registration
						<br />
						Utility
					</h1>
				</div>

				<nav className="nav-list" aria-label="Primary">
					{user?.role !== 'ADMIN' ? (
						<LockedNavItem to="/" disabled={locked} end>
							{homeLabel}
						</LockedNavItem>
					) : null}
					{user?.role === 'STUDENT' ? (
						<>
							<LockedNavItem to="/catalog" disabled={locked}>
								Course Registration
							</LockedNavItem>
						</>
					) : user?.role === 'PROFESSOR' || user?.role === 'ADMIN' ? null : (
						<>
							<LockedNavItem to="/profile" disabled={locked}>
								Profile
							</LockedNavItem>
						</>
					)}
					{user?.role === 'ADMIN' ? (
						<>
							<LockedNavItem to="/console/admin" disabled={locked} end isActive={(pathname, search) => pathname === '/console/admin' && !new URLSearchParams(search).get('tool')}>
								Admin Home
							</LockedNavItem>
							<LockedNavItem
								to="/console/admin?tool=users"
								disabled={locked}
								isActive={(pathname, search) => pathname === '/console/admin' && Boolean(new URLSearchParams(search).get('tool'))}
							>
								Admin Tools
							</LockedNavItem>
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
							<strong>Password update required.</strong> You must change your password to access registration systems.
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

export function ProfessorOnly({ children }: { children: ReactNode }) {
	const { user } = useAuth();

	if (user?.role !== 'PROFESSOR') {
		return <Navigate to="/profile" replace />;
	}

	return <>{children}</>;
}
