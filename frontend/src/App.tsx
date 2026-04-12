/*
Adi Avraham
CMSC495 Group Golf Capstone Project
App.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Defines the authenticated and public route tree for the frontend application.
*/

import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AuthGate } from './components/AuthGate';
import { useAuth } from './context/AuthContext';
import { AdminConsolePage } from './pages/AdminConsolePage.tsx';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { CourseCatalogPage } from './pages/CourseCatalogPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfessorSectionsPage } from './pages/ProfessorSectionsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

function HomePage() {
	const { user } = useAuth();

	if (user?.role === 'PROFESSOR') {
		return <ProfessorSectionsPage />;
	}

	if (user?.role === 'ADMIN') {
		return <AdminConsolePage area="home" />;
	}

	return <DashboardPage />;
}

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
					<Route index element={<HomePage />} />
					<Route path="catalog" element={<CourseCatalogPage />} />
					<Route path="professor/sections" element={<ProfessorSectionsPage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="change-password" element={<ChangePasswordPage />} />
					<Route path="console/admin" element={<AdminConsolePage area="home" />} />
					<Route path="console/admin/tools" element={<Navigate to="/console/admin?tool=users" replace />} />
					<Route path="console/admin/users" element={<Navigate to="/console/admin?tool=users" replace />} />
					<Route path="console/admin/courses" element={<Navigate to="/console/admin?tool=courses" replace />} />
					<Route path="console/admin/prerequisites" element={<Navigate to="/console/admin?tool=prerequisites" replace />} />
					<Route path="console/admin/semesters" element={<Navigate to="/console/admin?tool=semesters" replace />} />
					<Route path="console/admin/sections" element={<Navigate to="/console/admin?tool=sections" replace />} />
					<Route path="admin" element={<Navigate to="/console/admin" replace />} />
					<Route path="admin/tools" element={<Navigate to="/console/admin?tool=users" replace />} />
					<Route path="admin/users" element={<Navigate to="/console/admin?tool=users" replace />} />
					<Route path="admin/courses" element={<Navigate to="/console/admin?tool=courses" replace />} />
					<Route path="admin/prerequisites" element={<Navigate to="/console/admin?tool=prerequisites" replace />} />
					<Route path="admin/semesters" element={<Navigate to="/console/admin?tool=semesters" replace />} />
					<Route path="admin/sections" element={<Navigate to="/console/admin?tool=sections" replace />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
