import { assert, assertHasKeys, assertStatus } from '../shared.js';

export async function runCoreSuite(env) {
    const { harness, clients, ctx } = env;
    const { anonymous, admin } = clients;

    await harness.run(
        'Health check returns service status',
        'GET /api/health',
        { method: 'GET' },
        { status: 200, body: { message: 'API is running' } },
        async () => {
            const response = await anonymous.request('/api/health');
            assertStatus(response, 200);
            assert(response.body?.message === 'API is running', 'Health response message mismatch.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Unknown route returns 404',
        'GET /missing-route',
        { method: 'GET' },
        { status: 404, body: { error: 'Route Not Found' } },
        async () => {
            const response = await anonymous.request('/missing-route');
            assertStatus(response, 404);
            assert(response.body?.error === 'Route Not Found', '404 response mismatch.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Concurrent health checks succeed',
        'GET /api/health',
        { method: 'GET', concurrency: 8 },
        { status: 200, allResponses: true },
        async () => {
            const responses = await Promise.all(Array.from({ length: 8 }, () => anonymous.request('/api/health')));
            assert(responses.every((response) => response.status === 200), 'At least one concurrent health request failed.');
            return responses.map(harness.responseSummary);
        }
    );

    await harness.run(
        'Login request validates required fields',
        'POST /user/login',
        { method: 'POST', body: { email: ctx.admin.email } },
        { status: 400, bodyContains: 'Validation failed.' },
        async () => {
            const response = await anonymous.request('/user/login', {
                method: 'POST',
                body: { email: ctx.admin.email },
            });
            assertStatus(response, 400);
            assert(response.body?.error === 'Validation failed.', 'Expected validation failure.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Login rejects invalid credentials',
        'POST /user/login',
        { method: 'POST', body: { email: ctx.admin.email, password: 'WrongPassword!1' } },
        { status: 401, bodyContains: 'Invalid email and/or password.' },
        async () => {
            const response = await anonymous.request('/user/login', {
                method: 'POST',
                body: { email: ctx.admin.email, password: 'WrongPassword!1' },
            });
            assertStatus(response, 401);
            assert(response.body?.error === 'Invalid email and/or password.', 'Expected auth failure.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Logout requires an authenticated session',
        'GET /user/logout',
        { method: 'GET' },
        { status: 401 },
        async () => {
            const response = await anonymous.request('/user/logout');
            assertStatus(response, 401);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin login establishes a session',
        'POST /user/login',
        { method: 'POST', body: { email: ctx.admin.email, password: '[env password]' } },
        { status: 200, sessionCookie: 'sid', bodyKeys: ['message', 'firstLogin', 'User'] },
        async () => {
            const response = await harness.ensureCurrentPassword(admin, ctx.admin);
            ctx.admin.user = response.body.User;
            assert(admin.cookie.startsWith('sid='), 'Admin session cookie was not stored.');
            return {
                status: response.status,
                cookie: admin.cookie,
                body: response.body,
            };
        }
    );

    await harness.run(
        'Authenticated admin can read /user/me',
        'GET /user/me',
        { method: 'GET', client: 'admin' },
        { status: 200, bodyKeys: ['User'] },
        async () => {
            const response = await admin.request('/user/me');
            assertStatus(response, 200);
            assert(response.body?.User?.email === ctx.admin.user.email, 'Admin /user/me returned the wrong user.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Concurrent authenticated admin requests succeed',
        'GET /user/me',
        { method: 'GET', client: 'admin', concurrency: 6 },
        { status: 200, allResponses: true },
        async () => {
            const responses = await Promise.all(Array.from({ length: 6 }, () => admin.request('/user/me')));
            assert(responses.every((response) => response.status === 200), 'At least one concurrent /user/me request failed.');
            return responses.map(harness.responseSummary);
        }
    );

    await harness.run(
        'Admin list endpoint returns the expected envelope',
        'GET /admin?page=1&limit=5',
        { method: 'GET', client: 'admin', query: { page: 1, limit: 5 } },
        { status: 200, bodyKeys: ['User', 'Meta'] },
        async () => {
            const response = await admin.request('/admin?page=1&limit=5');
            assertStatus(response, 200);
            assert(Array.isArray(response.body?.User), 'User list must be an array.');
            assertHasKeys(response.body?.Meta, ['page', 'limit', 'total', 'totalPages'], 'Admin list meta');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin list rejects invalid role filters',
        'GET /admin?role=INVALID',
        { method: 'GET', client: 'admin', query: { role: 'INVALID' } },
        { status: 400 },
        async () => {
            const response = await admin.request('/admin?role=INVALID');
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );
}
