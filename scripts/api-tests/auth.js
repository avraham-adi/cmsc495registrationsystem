import { ADMIN_USER } from './config.js';
import { assertEqual, assertStatus, assertTruthy } from './assert.js';
import { authHeaders } from './http.js';
import { logPass } from './logger.js';

export async function loginAndGetAuth(request, email, password) {
    const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    assertStatus(res, 200, `Login failed for ${email}`);
    assertTruthy(res.body?.token, `Missing token for ${email}`, res.body);

    return {
        token: res.body.token,
        user: res.body.user,
        firstLogin: res.body.firstLogin,
    };
}

export async function runAuthSuite(ctx, request) {
    const health = await request('/api/health');
    assertStatus(health, 200, 'GET /api/health failed');
    assertEqual(health.body?.message, 'API is running', 'Unexpected health body', health.body);
    logPass('GET /api/health returns 200');

    const loginFailureCases = [
        {
            body: {},
            expectedStatus: 400,
            failureMessage: 'POST /api/auth/login should reject missing credentials',
            successMessage: 'POST /api/auth/login rejects missing credentials',
        },
        {
            body: { email: ADMIN_USER.email, password: 'WrongPassword' },
            expectedStatus: 401,
            failureMessage: 'POST /api/auth/login should reject invalid password',
            successMessage: 'POST /api/auth/login rejects invalid password',
        },
        {
            body: { email: 'thisEmailDoesnt@exist.com', password: 'WrongPassword' },
            expectedStatus: 401,
            failureMessage: 'POST /api/auth/login should reject invalid email',
            successMessage: 'POST /api/auth/login rejects invalid email',
        },
    ];

    for (const testCase of loginFailureCases) {
        const res = await request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(testCase.body),
        });
        assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
        logPass(testCase.successMessage);
    }

    ctx.adminAuth = await loginAndGetAuth(request, ADMIN_USER.email, ADMIN_USER.password);
    assertTruthy(ctx.adminAuth.user?.email, 'Missing user payload on admin login', ctx.adminAuth);
    assertEqual(ctx.adminAuth.user.email, ADMIN_USER.email, 'Unexpected admin email after login', ctx.adminAuth);
    if (typeof ctx.adminAuth.firstLogin !== 'boolean') {
        throw new Error(`Expected boolean firstLogin. Payload: ${JSON.stringify(ctx.adminAuth)}`);
    }
    logPass('POST /api/auth/login accepts valid credentials and returns token');

    const meAuthCases = [
        {
            options: undefined,
            expectedStatus: 401,
            failureMessage: 'GET /api/auth/me should reject missing token',
            successMessage: 'GET /api/auth/me rejects missing token',
        },
        {
            options: {
                headers: authHeaders('not-a-real-token'),
            },
            expectedStatus: 401,
            failureMessage: 'GET /api/auth/me should reject invalid token',
            successMessage: 'GET /api/auth/me rejects invalid token',
        },
    ];

    for (const testCase of meAuthCases) {
        const res = await request('/api/auth/me', testCase.options);
        assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
        logPass(testCase.successMessage);
    }

    const meWithValidToken = await request('/api/auth/me', {
        headers: authHeaders(ctx.adminAuth.token),
    });
    assertStatus(meWithValidToken, 200, 'GET /api/auth/me should return current user');
    assertTruthy(meWithValidToken.body?.user?.email, 'Missing /me user payload', meWithValidToken.body);
    assertEqual(meWithValidToken.body.user.email, ADMIN_USER.email, 'Unexpected /me email', meWithValidToken.body);
    logPass('GET /api/auth/me returns current user for valid token');

    const logoutWithoutToken = await request('/api/auth/logout', { method: 'POST' });
    assertStatus(logoutWithoutToken, 401, 'POST /api/auth/logout should reject missing token');
    logPass('POST /api/auth/logout rejects missing token');

    const logoutWithValidToken = await request('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders(ctx.adminAuth.token),
    });
    assertStatus(logoutWithValidToken, 200, 'POST /api/auth/logout should accept valid token');
    logPass('POST /api/auth/logout accepts valid token');
}

export async function runPasswordSuite(ctx, request) {
    const initialPasswordCases = [
        {
            options: {
                method: 'PATCH',
                body: JSON.stringify({ newPassword: 'SomeValidPassword123!' }),
            },
            expectedStatus: 401,
            failureMessage: 'PATCH /api/auth/change-password should reject missing token',
            successMessage: 'PATCH /api/auth/change-password rejects missing token',
        },
        {
            options: {
                method: 'PATCH',
                headers: authHeaders(ctx.nonAdminAuth.token),
                body: JSON.stringify({}),
            },
            expectedStatus: 400,
            failureMessage: 'PATCH /api/auth/change-password should reject missing new password',
            successMessage: 'PATCH /api/auth/change-password rejects missing new password',
        },
    ];

    for (const testCase of initialPasswordCases) {
        const res = await request('/api/auth/change-password', testCase.options);
        assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
        logPass(testCase.successMessage);
    }

    const policyCases = [
        ['Password', 'PATCH /api/auth/change-password rejects default password reuse'],
        [ctx.passwordPolicyTests.tooShort, 'PATCH /api/auth/change-password rejects too-short password'],
        [ctx.passwordPolicyTests.missingUppercase, 'PATCH /api/auth/change-password rejects password missing uppercase letter'],
        [ctx.passwordPolicyTests.missingLowercase, 'PATCH /api/auth/change-password rejects password missing lowercase letter'],
        [ctx.passwordPolicyTests.missingNumber, 'PATCH /api/auth/change-password rejects password missing number'],
        [ctx.passwordPolicyTests.missingSpecial, 'PATCH /api/auth/change-password rejects password missing special character'],
        [ctx.passwordPolicyTests.containsEmailLocalPart, 'PATCH /api/auth/change-password rejects password containing email local-part'],
    ];

    for (const [newPassword, successMessage] of policyCases) {
        const res = await request('/api/auth/change-password', {
            method: 'PATCH',
            headers: authHeaders(ctx.nonAdminAuth.token),
            body: JSON.stringify({ newPassword }),
        });
        assertStatus(res, 400, `${successMessage} failed`);
        logPass(successMessage);
    }

    const validPasswordChange = await request('/api/auth/change-password', {
        method: 'PATCH',
        headers: authHeaders(ctx.nonAdminAuth.token),
        body: JSON.stringify({ newPassword: ctx.newUserUpdatedPassword }),
    });
    assertStatus(validPasswordChange, 200, 'PATCH /api/auth/change-password should accept valid request');
    logPass('PATCH /api/auth/change-password accepts valid authenticated request');

    const oldPasswordRejected = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ctx.newUser.email,
            password: ctx.newUser.password,
        }),
    });
    assertStatus(oldPasswordRejected, 401, 'Old password should be rejected after password change');
    logPass('Old password is rejected after password change');

    ctx.updatedNonAdminAuth = await loginAndGetAuth(request, ctx.newUser.email, ctx.newUserUpdatedPassword);
    assertEqual(ctx.updatedNonAdminAuth.user?.email, ctx.newUser.email, 'Unexpected user after password change', ctx.updatedNonAdminAuth);
    assertEqual(ctx.updatedNonAdminAuth.firstLogin, false, 'Expected firstLogin false after password change', ctx.updatedNonAdminAuth);
    logPass('New password is accepted after password change');
}

export async function runUpdateUserInfoSuite(ctx, request) {
    const updatePayload = {
        name: ctx.updatedUserProfile.name,
        email: ctx.updatedUserProfile.email,
    };

    const withoutToken = await request('/api/auth/update-user', {
        method: 'PUT',
        body: JSON.stringify(updatePayload),
    });
    assertStatus(withoutToken, 401, 'POST /api/auth/update-user should reject missing token');
    logPass('PUT /api/auth/update-user rejects missing token');

    const withInvalidToken = await request('/api/auth/update-user', {
        method: 'PUT',
        headers: authHeaders('not-a-real-token'),
        body: JSON.stringify(updatePayload),
    });
    assertStatus(withInvalidToken, 401, 'PUT /api/auth/update-user should reject invalid token');
    logPass('PUT /api/auth/update-user rejects invalid token');

    const missingFieldCases = [
        [{ email: updatePayload.email }, 'PUT /api/auth/update-user rejects missing name'],
        [{ name: updatePayload.name }, 'PUT /api/auth/update-user rejects missing email'],
    ];

    for (const [body, successMessage] of missingFieldCases) {
        const res = await request('/api/auth/update-user', {
            method: 'PUT',
            headers: authHeaders(ctx.updatedNonAdminAuth.token),
            body: JSON.stringify(body),
        });
        assertStatus(res, 400, `${successMessage} failed`);
        logPass(successMessage);
    }

    const updateRes = await request('/api/auth/update-user', {
        method: 'PUT',
        headers: authHeaders(ctx.updatedNonAdminAuth.token),
        body: JSON.stringify(updatePayload),
    });
    assertStatus(updateRes, 200, 'PUT /api/auth/update-user should accept valid authenticated request');
    assertTruthy(updateRes.body?.token, 'PUT /api/auth/update-user should return a refreshed token', updateRes.body);
    assertEqual(updateRes.body?.user?.name, ctx.updatedUserProfile.name, 'PUT /api/auth/update-user should return updated name', updateRes.body);
    assertEqual(updateRes.body?.user?.email, ctx.updatedUserProfile.email, 'PUT /api/auth/update-user should return updated email', updateRes.body);
    logPass('PUT /api/auth/update-user accepts valid authenticated request');

    ctx.updatedNonAdminAuth = {
        token: updateRes.body.token,
        user: updateRes.body.user,
        firstLogin: false,
    };

    const meAfterUpdate = await request('/api/auth/me', {
        headers: authHeaders(ctx.updatedNonAdminAuth.token),
    });
    assertStatus(meAfterUpdate, 200, 'GET /api/auth/me should succeed after profile update');
    assertEqual(meAfterUpdate.body?.user?.name, ctx.updatedUserProfile.name, 'Updated name should be reflected in /me', meAfterUpdate.body);
    assertEqual(meAfterUpdate.body?.user?.email, ctx.updatedUserProfile.email, 'Updated email should be reflected in /me', meAfterUpdate.body);
    logPass('GET /api/auth/me reflects updated profile information');

    const passwordChangeAfterProfileUpdate = await request('/api/auth/change-password', {
        method: 'PATCH',
        headers: authHeaders(ctx.updatedNonAdminAuth.token),
        body: JSON.stringify({ newPassword: ctx.finalUserPassword }),
    });
    assertStatus(passwordChangeAfterProfileUpdate, 200, 'PATCH /api/auth/change-password should succeed with refreshed token after profile update');
    assertTruthy(passwordChangeAfterProfileUpdate.body?.token, 'Password change after profile update should return a token', passwordChangeAfterProfileUpdate.body);
    logPass('PATCH /api/auth/change-password works with refreshed token after profile update');

    const duplicateEmailRejected = await request('/api/auth/update-user', {
        method: 'PUT',
        headers: authHeaders(ctx.updatedNonAdminAuth.token),
        body: JSON.stringify({
            name: ctx.updatedUserProfile.name,
            email: ADMIN_USER.email,
        }),
    });
    assertStatus(duplicateEmailRejected, 409, 'PUT /api/auth/update-user should reject duplicate email addresses');
    logPass('PUT /api/auth/update-user rejects duplicate email addresses');

    const oldEmailLoginRejected = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ctx.newUser.email,
            password: ctx.newUserUpdatedPassword,
        }),
    });
    assertStatus(oldEmailLoginRejected, 401, 'Old email should be rejected after profile update');
    logPass('Old email is rejected after profile update');

    ctx.updatedNonAdminAuth = await loginAndGetAuth(request, ctx.updatedUserProfile.email, ctx.finalUserPassword);
    assertEqual(ctx.updatedNonAdminAuth.user?.name, ctx.updatedUserProfile.name, 'Unexpected name after profile update login', ctx.updatedNonAdminAuth);
    assertEqual(ctx.updatedNonAdminAuth.user?.email, ctx.updatedUserProfile.email, 'Unexpected email after profile update login', ctx.updatedNonAdminAuth);
    logPass('Updated email can be used to log in after profile update');
}
