import { request } from './client.ts';
import type { AuthUserResponse, ChangePasswordPayload, LoginPayload, LoginResponse, UpdateUserPayload } from '../types/api';

// Login Function
export function login(payload: LoginPayload) {
	return request<LoginResponse>('/user/login', {
		method: 'POST',
		body: payload,
	});
}

// Logout Function
export function logout() {
	return request<void>('/user/logout');
}

// Get Self
export function getUser() {
	return request<AuthUserResponse>('/user/me');
}

// Update Self
export function updUser(payload: UpdateUserPayload) {
	return request<AuthUserResponse>('/user/me', {
		method: 'PUT',
		body: payload,
	});
}

// Update Password
export function updPassword(payload: ChangePasswordPayload) {
	return request<AuthUserResponse>('/user/me', {
		method: 'PATCH',
		body: payload,
	});
}
