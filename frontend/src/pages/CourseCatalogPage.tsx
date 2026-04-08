import { StudentOnly } from '../components/AppShell';
import { useAuth } from '../context/AuthContext';

export function CourseCatalogPage() {
	const { user } = useAuth();

	return (
		<StudentOnly>
			<section className="panel stack">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Student Workflow</p>
						<h2>Course Catalog</h2>
					</div>
					<span className="pill subtle">Scaffold</span>
				</div>

				<p className="sidebar-copy">
					This page is the course catalog and will feature enrollment workflows here
				</p>

				<div className="info-grid">
					<div className="info-card">
						<span className="info-label">Current Student</span>
						<strong>{user?.name ?? 'Unknown user'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Catalog Status</span>
						<strong>Ready for API integration</strong>
					</div>
				</div>

				<section className="subpanel stack">
					<h3>Next Development Targets</h3>
					<p className="sidebar-copy">
						Semester picker, section list, enrollment cart, and registration logic.
					</p>
				</section>
			</section>
		</StudentOnly>
	);
}
