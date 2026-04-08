import { AdminOnly } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export function AdminUsersPage() {
	const { user } = useAuth();

	return (
		<AdminOnly>
			<section className="panel stack">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Admin Workflow</p>
						<h2>User Management</h2>
					</div>
					<span className="pill subtle">Scaffold</span>
				</div>

				<p className="sidebar-copy">
					This is a user management admin-only page.
				</p>

				<div className="info-grid">
					<div className="info-card">
						<span className="info-label">Admin User</span>
						<strong>{user?.name ?? 'Unknown user'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Role</span>
						<strong>{user?.role ?? 'N/A'}</strong>
					</div>
				</div>

				<section className="subpanel stack">
					<h3>Next Development Targets</h3>
					<p className="sidebar-copy">User search, role updates, account creation, and account removal.</p>
				</section>
			</section>
		</AdminOnly>
	);
}
