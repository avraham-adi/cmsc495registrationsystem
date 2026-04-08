import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { updPassword, getUser, login, logout, updUser } from '../api/auth';
import { ApiError } from '../api/client';
import type { ChangePasswordPayload, LoginPayload, UpdateUserPayload, User } from '../types/api';

// Authentication/User Context
type AuthContextValue = {
	user: User | null,
	isLoading: boolean,
	isAuthenticated: boolean,
	requiresPasswordChange: boolean,
	loginAction: (payload: LoginPayload) => Promise<User>,
	logoutAction: () => Promise<void>,
	refreshUser: () => Promise<User | null>,
	updateProfileAction: (payload: UpdateUserPayload) => Promise<User>,
	changePasswordAction: (payload: ChangePasswordPayload) => Promise<User>,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Authentican Information Provider
export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		void bootstrapSession();
	}, []);

	async function bootstrapSession() {
		try {
			const response = await getUser();
			setUser(response.User);
		} catch (error) {
			if (!(error instanceof ApiError) || error.status !== 401) {
				console.error(error);
			}
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}

	async function loginAction(payload: LoginPayload) {
		const response = await login(payload);
		setUser(response.User);
		return response.User;
	}

	async function logoutAction() {
		try {
			await logout();
		} finally {
			setUser(null);
		}
	}

	async function refreshUser() {
		try {
			const response = await getUser();
			setUser(response.User);
			return response.User;
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				setUser(null);
				return null;
			}
			throw error;
		}
	}

	async function updateProfileAction(payload: UpdateUserPayload) {
		const response = await updUser(payload);
		setUser(response.User);
		return response.User;
	}

	async function changePasswordAction(payload: ChangePasswordPayload) {
		const response = await updPassword(payload);
		setUser(response.User);
		return response.User;
	}

	const value: AuthContextValue = {
		user,
		isLoading,
		isAuthenticated: user !== null,
		requiresPasswordChange: user?.first_login === true,
		loginAction,
		logoutAction,
		refreshUser,
		updateProfileAction,
		changePasswordAction,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Apply context
export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}

	return context;
}
