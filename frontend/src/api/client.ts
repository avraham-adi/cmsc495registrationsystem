/*
Adi Avraham
CMSC495 Group Golf Capstone Project
client.ts
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Provides the shared frontend HTTP client and API error handling helpers.
*/

import type { ApiErrorPayload } from '../types/api';

// In local dev, keep requests same-origin so Vite can proxy them to the backend.
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

// API Error Class
export class ApiError extends Error {
	status: number;
	code: string | undefined;
	details: unknown | undefined;

	constructor(status: number, payload: ApiErrorPayload) {
		super(payload.error ?? payload.message ?? `Request failed with status ${status}`);
		this.name = 'ApiError';
		this.status = status;
		this.code = payload.code;
		this.details = payload.details;
	}
}

// Request Options
type RequestOptions = Omit<RequestInit, 'body'> & {
	body?: unknown;
};

// HTTP Helper to send a request and parse the response
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
	const headers = new Headers(options.headers);

	if (options.body !== undefined) {
		headers.set('Content-Type', 'application/json');
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers,
		credentials: 'include',
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
	});

	if (response.status === 204) {
		return undefined as T;
	}

	const text = await response.text();
	let payload: unknown;

	if (text) {
		try {
			payload = JSON.parse(text) as unknown;
		} catch {
			payload = { error: text };
		}
	}

	if (!response.ok) {
		throw new ApiError(response.status, (payload as ApiErrorPayload | undefined) ?? {});
	}

	return payload as T;
}
