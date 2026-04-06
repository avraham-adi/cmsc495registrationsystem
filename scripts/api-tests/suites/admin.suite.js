import { assert, assertStatus, CookieClient } from '../shared.js';

export async function runAdminSuite(env) {
    const { harness, clients, ctx } = env;
    const { admin } = clients;

    await harness.run(
        'Admin user creation validates request bodies',
        'POST /admin',
        { method: 'POST', client: 'admin', body: { name: 'Broken User' } },
        { status: 400 },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: { name: 'Broken User' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can create a professor user',
        'POST /admin',
        { method: 'POST', client: 'admin', body: ctx.users.professor },
        { status: 201, userType: 'PROFESSOR' },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: ctx.users.professor.name,
                    email: ctx.users.professor.email,
                    detail: ctx.users.professor.detail,
                    type: ctx.users.professor.type,
                },
            });
            assertStatus(response, 201);
            ctx.users.professor.user = response.body;
            assert(response.body?.role === 'PROFESSOR', 'Professor user was not created with the expected role.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can create a student user',
        'POST /admin',
        { method: 'POST', client: 'admin', body: ctx.users.student },
        { status: 201, userType: 'STUDENT' },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: ctx.users.student.name,
                    email: ctx.users.student.email,
                    detail: ctx.users.student.detail,
                    type: ctx.users.student.type,
                },
            });
            assertStatus(response, 201);
            ctx.users.student.user = response.body;
            assert(response.body?.role === 'STUDENT', 'Student user was not created with the expected role.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can create a second student user',
        'POST /admin',
        { method: 'POST', client: 'admin', body: ctx.users.otherStudent },
        { status: 201, userType: 'STUDENT' },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: ctx.users.otherStudent.name,
                    email: ctx.users.otherStudent.email,
                    detail: ctx.users.otherStudent.detail,
                    type: ctx.users.otherStudent.type,
                },
            });
            assertStatus(response, 201);
            ctx.users.otherStudent.user = response.body;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can create a temporary user for role-regression checks',
        'POST /admin',
        { method: 'POST', client: 'admin', body: ctx.users.temp },
        { status: 201 },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: ctx.users.temp.name,
                    email: ctx.users.temp.email,
                    detail: ctx.users.temp.detail,
                    type: ctx.users.temp.type,
                },
            });
            assertStatus(response, 201);
            ctx.users.temp.user = response.body;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin user creation rejects duplicate emails',
        'POST /admin',
        { method: 'POST', client: 'admin', body: ctx.users.student },
        { status: 409 },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: ctx.users.student.name,
                    email: ctx.users.student.email,
                    detail: ctx.users.student.detail,
                    type: ctx.users.student.type,
                },
            });
            assertStatus(response, 409);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin user creation rejects whitespace-only role details',
        'POST /admin',
        { method: 'POST', client: 'admin', body: { name: 'Whitespace Detail', email: 'whitespace.detail@example.edu', detail: '   ', type: 'STUDENT' } },
        { status: 400 },
        async () => {
            const response = await admin.request('/admin', {
                method: 'POST',
                body: {
                    name: 'Whitespace Detail',
                    email: 'whitespace.detail@example.edu',
                    detail: '   ',
                    type: 'STUDENT',
                },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can fetch a created user by id',
        `GET /admin/${ctx.users.professor.user?.id ?? ':id'}`,
        { method: 'GET', client: 'admin' },
        { status: 200 },
        async () => {
            assert(ctx.users.professor.user?.id, 'Professor user id is missing.');
            const response = await admin.request(`/admin/${ctx.users.professor.user.id}`);
            assertStatus(response, 200);
            assert(response.body?.email === ctx.users.professor.email, 'Fetched user did not match the created professor.');
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin list supports empty and populated search terms',
        'GET /admin?search=...',
        { method: 'GET', client: 'admin', queries: [{ search: '' }, { search: 'Runner Student' }] },
        { status: 200, multiple: true },
        async () => {
            const empty = await admin.request('/admin?search=');
            assertStatus(empty, 200);
            const populated = await admin.request('/admin?search=Runner%20Student');
            assertStatus(populated, 200);
            assert((populated.body?.User ?? []).length >= 1, 'Populated admin search should return at least one matching user.');
            return {
                empty: harness.responseSummary(empty),
                populated: harness.responseSummary(populated),
            };
        }
    );

    await harness.run(
        'Role updates validate request bodies',
        `PUT /admin/${ctx.users.temp.user?.id ?? ':id'}/role`,
        { method: 'PUT', client: 'admin', body: { type: 'INVALID', detail: 'Bad' } },
        { status: 400 },
        async () => {
            assert(ctx.users.temp.user?.id, 'Temp user id is missing.');
            const response = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'INVALID', detail: 'Bad' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Role updates reject whitespace-only details',
        `PUT /admin/${ctx.users.temp.user?.id ?? ':id'}/role`,
        { method: 'PUT', client: 'admin', body: { type: 'PROFESSOR', detail: '   ' } },
        { status: 400 },
        async () => {
            const response = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'PROFESSOR', detail: '   ' },
            });
            assertStatus(response, 400);
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Admin can update a user role',
        `PUT /admin/${ctx.users.temp.user?.id ?? ':id'}/role`,
        { method: 'PUT', client: 'admin', body: { type: 'PROFESSOR', detail: 'Software Engineering' } },
        { status: 200, userType: 'PROFESSOR' },
        async () => {
            assert(ctx.users.temp.user?.id, 'Temp user id is missing.');
            const response = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'PROFESSOR', detail: 'Software Engineering' },
            });
            assertStatus(response, 200);
            assert(response.body?.role === 'PROFESSOR', 'Role update did not persist the new role.');
            ctx.users.temp.user = response.body;
            return harness.responseSummary(response);
        }
    );

    await harness.run(
        'Role changes take effect immediately for an already-authenticated session',
        'GET /admin + PUT /admin/:id/role',
        { method: 'MULTI', client: 'temp-role-session' },
        { elevated: 200, demoted: 403 },
        async () => {
            const tempClient = new CookieClient(harness.baseUrl);
            const loginResponse = await harness.login(tempClient, ctx.users.temp.email, ctx.users.temp.password);
            assertStatus(loginResponse, 200);
            assert(loginResponse.body?.firstLogin === true, 'Temp role-check user should start on first login.');

            const patchResponse = await tempClient.request('/user/me', {
                method: 'PATCH',
                body: { password: ctx.users.temp.nextPassword },
            });
            assertStatus(patchResponse, 200);
            ctx.users.temp.password = ctx.users.temp.nextPassword;

            const elevate = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'ADMIN', detail: '7' },
            });
            assertStatus(elevate, 200);
            ctx.users.temp.user = elevate.body;

            const afterElevate = await tempClient.request('/admin');
            assertStatus(afterElevate, 200);

            const demote = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'STUDENT', detail: 'Computer Science' },
            });
            assertStatus(demote, 200);
            ctx.users.temp.user = demote.body;

            const afterDemote = await tempClient.request('/admin');
            assertStatus(afterDemote, 403);

            return {
                afterElevate: harness.responseSummary(afterElevate),
                afterDemote: harness.responseSummary(afterDemote),
            };
        }
    );

    await harness.run(
        'Demoting an admin revokes admin access for a second already-authenticated session',
        'GET /admin after remote demotion',
        { method: 'MULTI', client: 'temp-second-admin-session' },
        { before: 200, after: 403 },
        async () => {
            const secondAdminSession = new CookieClient(harness.baseUrl);

            const promote = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'ADMIN', detail: '9' },
            });
            assertStatus(promote, 200);
            ctx.users.temp.user = promote.body;

            const loginResponse = await harness.login(secondAdminSession, ctx.users.temp.email, ctx.users.temp.password);
            assertStatus(loginResponse, 200);
            const before = await secondAdminSession.request('/admin');
            assertStatus(before, 200);

            const demote = await admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
                method: 'PUT',
                body: { type: 'STUDENT', detail: 'Computer Science' },
            });
            assertStatus(demote, 200);
            ctx.users.temp.user = demote.body;

            const after = await secondAdminSession.request('/admin');
            assertStatus(after, 403);

            return {
                before: harness.responseSummary(before),
                after: harness.responseSummary(after),
            };
        }
    );
}
