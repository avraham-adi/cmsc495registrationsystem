import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

// Authentication ""middleware"""
export function AuthGate({ children }: { children: ReactNode }) {
	const { isAuthenticated, isLoading, requiresPasswordChange } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return <div className="page-shell">Loading session...</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (requiresPasswordChange && location.pathname !== '/change-password') {
		return <Navigate to="/change-password" replace />;
	}

	return <>{children}</>;
}
