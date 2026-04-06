import * as db from '../../../backend/src/db/connection.js';
import { assert, assertStatus, CookieClient, strongPassword } from '../shared.js';

function getSessionId(client) {
    const v = client.cookie?.split('=', 2)[1];
    if (!v) {
        return null;
    }

    const d = decodeURIComponent(v);
    if (!d.startsWith('s:')) {
        return d;
    }

    return d.slice(2).split('.', 1)[0] ?? null;
}

export async function runSessionAuthSuite(env) {
    const { harness, clients, ctx } = env;
    const { student, professor, otherStudent } = clients;

    await harness.run(
        'Student first login returns firstLogin=true',
        'POST /user/login',
        { method: 'POST', client: 'student', body: { email: ctx.users.student.email, password: '[default password]' } },
        { status: 200, firstLogin: true },
        async () => {
            const response = await harness.login(student, ctx.users.student.email, ctx.users.student.password);
            assertStatus(response, 200);
            assert(response.body?.firstLogin === true, 'Student default login should indicate first-login state.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Login rejects untrimmed email input',
        'POST /user/login',
        { method: 'POST', client: 'student', body: { email: ` ${ctx.users.student.email} `, password: '[default password]' } },
        { status: 400 },
        async () => {
            const response = await student.request('/user/login', {
                method: 'POST',
                body: { email: ` ${ctx.users.student.email} `, password: ctx.users.student.password },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Login regenerates the session id instead of reusing a supplied cookie',
        'POST /user/login',
        { method: 'POST', client: 'student-preseeded-cookie' },
        { status: 200, rotatesCookie: true },
        async () => {
            const seeded = new CookieClient(harness.baseUrl, 'sid=prelogin-session-id');
            const response = await harness.login(seeded, ctx.users.student.email, ctx.users.student.password);
            assertStatus(response, 200);
            assert(seeded.cookie && seeded.cookie !== 'sid=prelogin-session-id', 'Login should rotate away from the supplied pre-login cookie.');
            return {
                response: harness.responseSummary(response),
                cookie: seeded.cookie,
            };
        }
    );

    const staleStudent = student.clone();

    await harness.run(
        'First-login students can still fetch /user/me',
        'GET /user/me',
        { method: 'GET', client: 'student' },
        { status: 200 },
        async () => {
            const response = await student.request('/user/me');
            assertStatus(response, 200);
            assert(response.body?.User?.email === ctx.users.student.email, 'Student /user/me mismatch.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'First-login students are blocked from protected non-self routes',
        'POST /enrollment',
        { method: 'POST', client: 'student', body: { stuId: 1, secId: 1, code: 'TEST-CODE' } },
        { status: 403, bodyContains: 'Password change required before accessing this resource.' },
        async () => {
            const response = await student.request('/enrollment', {
                method: 'POST',
                body: { stuId: 1, secId: 1, code: 'TEST-CODE' },
            });
            assertStatus(response, 403);
            assert(
                response.body?.error === 'Password change required before accessing this resource.',
                'Expected first-login block for student.'
            );
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Password updates enforce validation rules',
        'PATCH /user/me',
        { method: 'PATCH', client: 'student', body: { password: 'short' } },
        { status: 400 },
        async () => {
            const response = await student.request('/user/me', {
                method: 'PATCH',
                body: { password: 'short' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Password updates reject the literal default password',
        'PATCH /user/me',
        { method: 'PATCH', client: 'student', body: { password: 'Password' } },
        { status: 400 },
        async () => {
            const response = await student.request('/user/me', {
                method: 'PATCH',
                body: { password: 'Password' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Password updates reject values missing an uppercase letter',
        'PATCH /user/me',
        { method: 'PATCH', client: 'student', body: { password: 'runner#2026!aa1' } },
        { status: 400 },
        async () => {
            const response = await student.request('/user/me', {
                method: 'PATCH',
                body: { password: 'runner#2026!aa1' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Password updates reject values containing the email local-part',
        'PATCH /user/me',
        { method: 'PATCH', client: 'student', body: { password: 'runner.student#2026!Aa1' } },
        { status: 400 },
        async () => {
            const response = await student.request('/user/me', {
                method: 'PATCH',
                body: { password: 'runner.student#2026!Aa1' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Student can change password',
        'PATCH /user/me',
        { method: 'PATCH', client: 'student', body: { password: '[new strong password]' } },
        { status: 200, bodyKeys: ['User'] },
        async () => {
            const response = await student.request('/user/me', {
                method: 'PATCH',
                body: { password: ctx.users.student.nextPassword },
            });
            assertStatus(response, 200);
            ctx.users.student.password = ctx.users.student.nextPassword;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Password change invalidates the prior session version',
        'GET /user/me',
        { method: 'GET', client: 'staleStudent' },
        { status: 401 },
        async () => {
            const response = await staleStudent.request('/user/me');
            assertStatus(response, 401);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Concurrent requests from the stale pre-rotation session are all rejected',
        'GET /user/me',
        { method: 'GET', client: 'staleStudent', concurrency: 3 },
        { status: 401, allResponses: true },
        async () => {
            const responses = await Promise.all(Array.from({ length: 3 }, () => staleStudent.request('/user/me')));
            assert(responses.every((response) => response.status === 401), 'Every stale session request should be rejected after password rotation.');
            return responses.map(harness.responseSummary);
        }
    );

    await harness.run(
        'Current student session remains valid after password rotation',
        'GET /user/me',
        { method: 'GET', client: 'student' },
        { status: 200 },
        async () => {
            const response = await student.request('/user/me');
            assertStatus(response, 200);
            assert(response.body?.User?.first_login === false, 'Student should no longer be on first login.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Professor can change their default password on first login',
        'PATCH /user/me',
        { method: 'PATCH', client: 'professor', body: { password: '[new strong password]' } },
        { status: 200 },
        async () => {
            const loginResponse = await harness.login(professor, ctx.users.professor.email, ctx.users.professor.password);
            assertStatus(loginResponse, 200);
            assert(loginResponse.body?.firstLogin === true, 'Professor should initially be on first login.');
            const response = await professor.request('/user/me', {
                method: 'PATCH',
                body: { password: ctx.users.professor.nextPassword },
            });
            assertStatus(response, 200);
            ctx.users.professor.password = ctx.users.professor.nextPassword;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Second student can change password and establish a session',
        'PATCH /user/me',
        { method: 'PATCH', client: 'otherStudent', body: { password: '[new strong password]' } },
        { status: 200 },
        async () => {
            const loginResponse = await harness.login(otherStudent, ctx.users.otherStudent.email, ctx.users.otherStudent.password);
            assertStatus(loginResponse, 200);
            assert(loginResponse.body?.firstLogin === true, 'Second student should initially be on first login.');
            const response = await otherStudent.request('/user/me', {
                method: 'PATCH',
                body: { password: ctx.users.otherStudent.nextPassword },
            });
            assertStatus(response, 200);
            ctx.users.otherStudent.password = ctx.users.otherStudent.nextPassword;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'A second active session is invalidated after password rotation',
        'GET /user/me',
        { method: 'GET', client: 'otherStudent-secondary' },
        { status: 401 },
        async () => {
            const secondary = new CookieClient(harness.baseUrl);
            const loginResponse = await harness.login(secondary, ctx.users.otherStudent.email, ctx.users.otherStudent.password);
            assertStatus(loginResponse, 200);

            const next = strongPassword('StudentRunnerTwoAgain');
            const patchResponse = await otherStudent.request('/user/me', {
                method: 'PATCH',
                body: { password: next },
            });
            assertStatus(patchResponse, 200);
            ctx.users.otherStudent.password = next;

            const response = await secondary.request('/user/me');
            assertStatus(response, 401);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Repeated logout on the same session is unauthenticated after the first success',
        'GET /user/logout',
        { method: 'GET', client: 'ephemeral-student' },
        { first: 200, second: 401 },
        async () => {
            const ephemeral = new CookieClient(harness.baseUrl);
            const loginResponse = await harness.login(ephemeral, ctx.users.student.email, ctx.users.student.password);
            assertStatus(loginResponse, 200);

            const first = await ephemeral.request('/user/logout');
            assertStatus(first, 200);
            const second = await ephemeral.request('/user/logout');
            assertStatus(second, 401);

            return {
                first: harness.responseSummary(first),
                second: harness.responseSummary(second),
            };
        }
    );

    await harness.run(
        'Logout removes the backing server-side session row',
        'GET /user/logout + DB sessions lookup',
        { method: 'GET', client: 'ephemeral-professor' },
        { status: 200, removed: true },
        async () => {
            const ephemeral = new CookieClient(harness.baseUrl);
            const loginResponse = await harness.login(ephemeral, ctx.users.professor.email, ctx.users.professor.password);
            assertStatus(loginResponse, 200);
            const sid = getSessionId(ephemeral);
            assert(sid, 'Expected an active session id before logout.');

            const before = await db.query('SELECT COUNT(*) AS count FROM sessions WHERE session_id = ?', [sid]);
            assert(Number(before[0].count) === 1, 'Expected the backing session row to exist before logout.');

            const logoutResponse = await ephemeral.request('/user/logout');
            assertStatus(logoutResponse, 200);

            const after = await db.query('SELECT COUNT(*) AS count FROM sessions WHERE session_id = ?', [sid]);
            assert(Number(after[0].count) === 0, 'Expected the backing session row to be removed after logout.');

            return {
                logout: harness.responseSummary(logoutResponse),
                sid,
            };
        }
    );

    await harness.run(
        'Non-admin authenticated users cannot access admin routes',
        'GET /admin',
        { method: 'GET', client: 'student' },
        { status: 403 },
        async () => {
            const response = await student.request('/admin');
            assertStatus(response, 403);
            return harness.responseSummary(response);
        }
    );
}
