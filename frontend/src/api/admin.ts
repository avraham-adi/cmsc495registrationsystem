import { request } from './client';
import type { AdminUserCreatePayload, AdminUserRoleUpdatePayload, User, UserListResponse, UserRole } from '../types/api';

type UserListQuery = {
	page?: number,
	limit?: number,
	search?: string,
	role?: UserRole | '',
};

export function listUsers(query: UserListQuery = {}) {
	const params = new URLSearchParams();

	if (query.page) params.set('page', String(query.page));
	if (query.limit) params.set('limit', String(query.limit));
	if (query.search) params.set('search', query.search);
	if (query.role) params.set('role', query.role);

	const suffix = params.toString();
	return request<UserListResponse>(`/admin${suffix ? `?${suffix}` : ''}`);
}

export function createUser(payload: AdminUserCreatePayload) {
	return request<User>('/admin', {
		method: 'POST',
		body: payload,
	});
}

export function updateUserRole(id: number, payload: AdminUserRoleUpdatePayload) {
	return request<User>(`/admin/${id}/role`, {
		method: 'PUT',
		body: payload,
	});
}

export function deleteUser(id: number) {
	return request<void>(`/admin/${id}`, {
		method: 'DELETE',
	});
}
