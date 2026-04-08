import { StudentOnly } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export function DashboardPage() {
	const { user } = useAuth();

	return (
		<StudentOnly>
			<section className="panel stack">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Student Workflow</p>
						<h2>Dashboard</h2>
					</div>
					<span className="pill subtle">Scaffold</span>
				</div>

				<p className="sidebar-copy">
					This is a dashboard for the authenticated student.
				</p>

				<div className="info-grid">
					<div className="info-card">
						<span className="info-label">Student Name</span>
						<strong>{user?.name ?? 'Unknown user'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Student ID</span>
						<strong>{user?.role_id ?? 'N/A'}</strong>
					</div>
				</div>

				<section className="subpanel stack">
					<h3>Next Development Targets</h3>
					<p className="sidebar-copy">
						Enrollment summary, weekly schedule, and recent registration activity.
					</p>
				</section>
			</section>
		</StudentOnly>
	);
}
