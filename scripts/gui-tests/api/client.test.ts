import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ApiError, request } from '../../../frontend/src/api/client';

describe('api client request', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('sends requests with credentials included', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		await request('/health');
		expect(globalThis.fetch).toHaveBeenCalledWith('/health', expect.objectContaining({ credentials: 'include' }));
	});

	it('adds json content type when a request body is provided', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
		await request('/user/login', { method: 'POST', body: { email: 'a@example.edu' } });
		expect(globalThis.fetch).toHaveBeenCalledWith('/user/login', expect.objectContaining({
			body: JSON.stringify({ email: 'a@example.edu' }),
			headers: expect.any(Headers),
		}));
	});

	it('returns undefined for 204 responses', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 204 }));
		await expect(request('/user/logout')).resolves.toBeUndefined();
	});

	it('parses json success payloads', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ message: 'ok' }), { status: 200 }));
		await expect(request<{ message: string }>('/test')).resolves.toEqual({ message: 'ok' });
	});

	it('wraps json error payloads in ApiError', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response(JSON.stringify({ error: 'Nope', code: 'BAD' }), { status: 400 }));
		await expect(request('/test')).rejects.toEqual(expect.objectContaining({ name: 'ApiError', status: 400, code: 'BAD', message: 'Nope' }));
	});

	it('wraps plain-text error payloads in ApiError', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response('Bad plain text', { status: 500 }));
		await expect(request('/test')).rejects.toEqual(expect.objectContaining({ name: 'ApiError', status: 500, message: 'Bad plain text' }));
	});

	it('uses the default fallback message when an error body is empty', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue(new Response('', { status: 404 }));
		await expect(request('/missing')).rejects.toEqual(expect.objectContaining({ message: 'Request failed with status 404' }));
	});

	it('preserves details on ApiError instances', () => {
		const error = new ApiError(422, { error: 'Bad', details: { field: 'email' } });
		expect(error.details).toEqual({ field: 'email' });
	});

	it('supports concurrent requests resolving independently', async () => {
		vi.mocked(globalThis.fetch)
			.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve(new Response(JSON.stringify({ id: 1 }), { status: 200 })), 20)))
			.mockImplementationOnce(() => Promise.resolve(new Response(JSON.stringify({ id: 2 }), { status: 200 })));

		const [first, second] = await Promise.all([request<{ id: number }>('/one'), request<{ id: number }>('/two')]);

		expect(first.id).toBe(1);
		expect(second.id).toBe(2);
	});
});
