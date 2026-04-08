import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthGate } from './components/AuthGate';
import { AdminUsersPage } from './pages/AdminUsersPage.tsx';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { CourseCatalogPage } from './pages/CourseCatalogPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

// Routes navigation
export default function App() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route
				path="/"
				element={
					<AuthGate>
						<AppShell />
					</AuthGate>
				}
			>
				<Route index element={<DashboardPage />} />
				<Route path="catalog" element={<CourseCatalogPage />} />
				<Route path="profile" element={<ProfilePage />} />
				<Route path="change-password" element={<ChangePasswordPage />} />
				<Route path="admin/users" element={<AdminUsersPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
