/*
Adi Avraham
CMSC495 Group Golf Capstone Project
AuthContext.tsx
input
session API responses and auth-related form actions
output
context state and auth actions for the React application
description
Stores the authenticated user and exposes shared login, logout, refresh, profile, and password actions.
*/

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { updPassword, getUser, login, logout, updUser } from '../api/auth';
import { ApiError } from '../api/client';
import type { ChangePasswordPayload, LoginPayload, UpdateUserPayload, User } from '../types/api';

// Describes the shared auth state and actions exposed to the React tree.
type AuthContextValue = {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	requiresPasswordChange: boolean;
	loginAction: (payload: LoginPayload) => Promise<User>;
	logoutAction: () => Promise<void>;
	refreshUser: () => Promise<User | null>;
	updateProfileAction: (payload: UpdateUserPayload) => Promise<User>;
	changePasswordAction: (payload: ChangePasswordPayload) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provides server-backed auth state and actions to the application.
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
		await updPassword(payload);
		const refreshedUser = await refreshUser();

		if (!refreshedUser) {
			throw new Error('Session refresh failed after password update.');
		}

		setUser(refreshedUser);
		return refreshedUser;
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

// Returns the active auth context and guards against missing providers.
export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}

	return context;
}
