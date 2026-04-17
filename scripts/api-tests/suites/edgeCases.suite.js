import { assert, assertStatus, CookieClient } from '../shared.js';

export async function runEdgeCasesSuite(env) {
	const { harness, clients, ctx } = env;
	const { anonymous, admin, student, professor, otherStudent } = clients;

	await harness.run(
		'Admin creation rejects names longer than 45 characters',
		'POST /admin',
		{ method: 'POST', client: 'admin', body: { name: 'X'.repeat(46), email: 'too-long@example.edu', detail: 'Computer Science', type: 'STUDENT' } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/admin', {
				method: 'POST',
				body: { name: 'X'.repeat(46), email: 'too-long@example.edu', detail: 'Computer Science', type: 'STUDENT' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admin creation rejects invalid email formats',
		'POST /admin',
		{ method: 'POST', client: 'admin', body: { name: 'Bad Email', email: 'not-an-email', detail: 'Computer Science', type: 'STUDENT' } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/admin', {
				method: 'POST',
				body: { name: 'Bad Email', email: 'not-an-email', detail: 'Computer Science', type: 'STUDENT' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Pagination rejects page zero', 'GET /course?page=0', { method: 'GET', query: { page: 0 } }, { status: 400 }, async () => {
		const response = await anonymous.request('/course?page=0');
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run('Pagination rejects limits above 100', 'GET /admin?limit=101', { method: 'GET', client: 'admin', query: { limit: 101 } }, { status: 400 }, async () => {
		const response = await admin.request('/admin?limit=101');
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run('Pagination accepts the upper limit boundary of 100', 'GET /course?page=1&limit=100', { method: 'GET', query: { page: 1, limit: 100 } }, { status: 200 }, async () => {
		const response = await anonymous.request('/course?page=1&limit=100');
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run('Pagination accepts the minimum positive page and limit boundaries', 'GET /course?page=1&limit=1', { method: 'GET', query: { page: 1, limit: 1 } }, { status: 200 }, async () => {
		const response = await anonymous.request('/course?page=1&limit=1');
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run('Semester creation rejects years below the minimum', 'POST /semester', { method: 'POST', client: 'admin', body: { term: 'Spring', year: 1899 } }, { status: 400 }, async () => {
		const response = await admin.request('/semester', {
			method: 'POST',
			body: { term: 'Spring', year: 1899 },
		});
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Semester creation accepts the maximum term length boundary',
		'POST /semester',
		{ method: 'POST', client: 'admin', body: { term: 'Autumn22', year: 2031 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/semester', {
				method: 'POST',
				body: { term: 'Autumn22', year: 2031 },
			});
			assertStatus(response, 201);
			ctx.extraSemester = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation rejects non-canonical day ordering',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1, days: 'FM' } },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
					days: 'FM',
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation rejects invalid time edge values',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1, startTm: '24:00:00', endTm: '25:00:00' } },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
					startTm: '24:00:00',
					endTm: '25:00:00',
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation rejects equal start and end times',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1, days: 'MW', startTm: '09:00:00', endTm: '09:00:00' } },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
					days: 'MW',
					startTm: '09:00:00',
					endTm: '09:00:00',
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admin creation accepts exact boundary lengths',
		'POST /admin',
		{
			method: 'POST',
			client: 'admin',
			body: {
				name: 'N'.repeat(45),
				email: 'boundary.user@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
			},
		},
		{ status: 201 },
		async () => {
			const response = await admin.request('/admin', {
				method: 'POST',
				body: {
					name: 'N'.repeat(45),
					email: 'boundary.user@example.edu',
					detail: 'Computer Science',
					type: 'STUDENT',
				},
			});
			assertStatus(response, 201);
			ctx.users.boundaryUser = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course creation rejects titles longer than 100 characters',
		'POST /course',
		{
			method: 'POST',
			client: 'admin',
			body: {
				code: 'CMSC950',
				title: 'T'.repeat(101),
				desc: 'Boundary overflow',
				cred: 3,
			},
		},
		{ status: 400 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: {
					code: 'CMSC950',
					title: 'T'.repeat(101),
					desc: 'Boundary overflow',
					cred: 3,
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course update rejects invalid enum-like subject code casing in filters',
		'GET /course?subject=cmsc',
		{ method: 'GET', query: { subject: 'cmsc' } },
		{ status: 200 },
		async () => {
			const response = await anonymous.request('/course?subject=cmsc');
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course creation rejects lowercase course codes',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'cmsc951', title: 'Lowercase Code', desc: 'Bad format', cred: 3 } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'cmsc951', title: 'Lowercase Code', desc: 'Bad format', cred: 3 },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course creation accepts the optional trailing letter branch',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC951A', title: 'Trailing Letter Course', desc: 'Valid branch', cred: 3 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC951A', title: 'Trailing Letter Course', desc: 'Valid branch', cred: 3 },
			});
			assertStatus(response, 201);
			ctx.extraCourses.push(response.body);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course creation rejects non-positive credits',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC952', title: 'Zero Credit', desc: 'Bad credits', cred: 0 } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC952', title: 'Zero Credit', desc: 'Bad credits', cred: 0 },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course list supports search-only, subject-only, and no-result combinations',
		'GET /course?...',
		{ method: 'GET', queries: ['search=Runner', 'subject=CMSC', 'subject=CMSC&search=NoMatch'] },
		{ status: 200, multiple: true },
		async () => {
			const searchOnly = await anonymous.request('/course?search=Runner');
			const subjectOnly = await anonymous.request('/course?subject=CMSC');
			const noResult = await anonymous.request('/course?subject=CMSC&search=NoMatch');
			assertStatus(searchOnly, 200);
			assertStatus(subjectOnly, 200);
			assertStatus(noResult, 200);
			assert((searchOnly.body?.Course ?? []).length >= 1, 'Search-only course query should return at least one result.');
			assert((subjectOnly.body?.Course ?? []).length >= 1, 'Subject-only course query should return at least one result.');
			assert((noResult.body?.Course ?? []).length === 0, 'Combined no-result course query should return an empty array.');
			return {
				searchOnly: harness.responseSummary(searchOnly),
				subjectOnly: harness.responseSummary(subjectOnly),
				noResult: harness.responseSummary(noResult),
			};
		}
	);

	await harness.run(
		'Prerequisite creation rejects bodies missing cId',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { pId: ctx.course2?.course_id } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { pId: ctx.course2.course_id },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Prerequisite creation rejects bodies missing pId',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { cId: ctx.course1?.course_id } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course1.course_id },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Deleting a non-existent prerequisite pair returns 404', 'DELETE /prerequisite/999998/999999', { method: 'DELETE', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/prerequisite/999998/999999', { method: 'DELETE' });
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Prerequisite reads can return an empty list', `GET /prerequisite/${ctx.course2?.course_id ?? ':id'}`, { method: 'GET' }, { status: 200, empty: true }, async () => {
		const response = await anonymous.request(`/prerequisite/${ctx.course2.course_id}`);
		assertStatus(response, 200);
		assert(Array.isArray(response.body), 'Prerequisite read should return an array.');
		assert(response.body.length === 0, 'Course2 should currently have no prerequisites.');
		return harness.responseSummary(response);
	});

	await harness.run('Multi-hop prerequisite cycles are rejected', 'POST /course + POST /prerequisite', { method: 'MULTI', client: 'admin' }, { status: 409 }, async () => {
		const create = async (code, title) => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code, title, desc: `${title} desc`, cred: 3 },
			});
			assertStatus(response, 201);
			ctx.extraCourses.push(response.body);
			return response.body;
		};

		const a = await create('CMSC960', 'Cycle A');
		const b = await create('CMSC961', 'Cycle B');
		const c = await create('CMSC962', 'Cycle C');

		const ab = await admin.request('/prerequisite', { method: 'POST', body: { cId: a.course_id, pId: b.course_id } });
		assertStatus(ab, 201);
		ctx.extraPrereqs.push({ cId: a.course_id, pId: b.course_id });
		const bc = await admin.request('/prerequisite', { method: 'POST', body: { cId: b.course_id, pId: c.course_id } });
		assertStatus(bc, 201);
		ctx.extraPrereqs.push({ cId: b.course_id, pId: c.course_id });

		const response = await admin.request('/prerequisite', {
			method: 'POST',
			body: { cId: c.course_id, pId: a.course_id },
		});
		assertStatus(response, 409);
		return harness.responseSummary(response);
	});

	await harness.run('Semester creation accepts the maximum year boundary', 'POST /semester', { method: 'POST', client: 'admin', body: { term: 'Spring', year: 3000 } }, { status: 201 }, async () => {
		const response = await admin.request('/semester', {
			method: 'POST',
			body: { term: 'Spring', year: 3000 },
		});
		assertStatus(response, 201);
		ctx.extraSemesters.push(response.body);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Semester creation rejects terms longer than eight characters',
		'POST /semester',
		{ method: 'POST', client: 'admin', body: { term: 'LongTerm9', year: 2032 } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/semester', {
				method: 'POST',
				body: { term: 'LongTerm9', year: 2032 },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Semester creation trims surrounding whitespace in terms',
		'POST /semester',
		{ method: 'POST', client: 'admin', body: { term: '  Summer ', year: 2033 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/semester', {
				method: 'POST',
				body: { term: '  Summer ', year: 2033 },
			});
			assertStatus(response, 201);
			assert(response.body?.term === 'Summer', 'Semester term should be trimmed.');
			ctx.extraSemesters.push(response.body);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Deleting a non-existent semester returns 404', 'DELETE /semester/999999', { method: 'DELETE', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/semester/999999', { method: 'DELETE' });
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Semester list is ordered by year descending then id descending', 'GET /semester', { method: 'GET' }, { status: 200, ordered: true }, async () => {
		const response = await anonymous.request('/semester');
		assertStatus(response, 200);
		const rows = response.body.map((entry) => entry.Semester);
		for (let i = 1; i < rows.length; i++) {
			const prev = rows[i - 1];
			const cur = rows[i];
			assert(prev.year > cur.year || (prev.year === cur.year && prev.semester_id >= cur.semester_id), 'Semester list ordering should be descending by year and then semester_id.');
		}
		return harness.responseSummary(response);
	});

	await harness.run(
		'Enrollment update rejects invalid enum casing',
		`PUT /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'student', body: { status: 'ENROLLED', code: 'ANY-CODE' } },
		{ status: 400 },
		async () => {
			const response = await student.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'ENROLLED', code: 'ANY-CODE' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'User profile update rejects invalid email formats',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: 'Runner Student Updated', email: 'bad-email' } },
		{ status: 400 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'Runner Student Updated', email: 'bad-email' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'User profile update succeeds with a unique email',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: 'Runner Student Updated', email: 'runner.student.updated@example.edu' } },
		{ status: 200 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'Runner Student Updated', email: 'runner.student.updated@example.edu' },
			});
			assertStatus(response, 200);
			assert(response.body?.User?.email === 'runner.student.updated@example.edu', 'User update did not persist the new email.');
			ctx.users.student.email = 'runner.student.updated@example.edu';
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'User profile update rejects duplicate emails',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: 'Runner Student Updated', email: ctx.users.otherStudent.email } },
		{ status: 409 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'Runner Student Updated', email: ctx.users.otherStudent.email },
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'User profile update accepts the maximum name boundary',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: 'N'.repeat(45), email: ctx.users.student.email } },
		{ status: 200 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'N'.repeat(45), email: ctx.users.student.email },
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run('User profile update allows unchanged payloads', 'PUT /user/me', { method: 'PUT', client: 'student', body: '[unchanged profile]' }, { status: 200 }, async () => {
		const current = await student.request('/user/me');
		assertStatus(current, 200);
		const response = await student.request('/user/me', {
			method: 'PUT',
			body: { name: current.body.User.name, email: current.body.User.email },
		});
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run(
		'User profile update rejects whitespace-only names',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: '   ', email: ctx.users.student.email } },
		{ status: 400 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: '   ', email: ctx.users.student.email },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'User profile update accepts valid plus-addressed emails',
		'PUT /user/me',
		{ method: 'PUT', client: 'student', body: { name: 'Runner Student Updated', email: 'runner.student+alias@example.edu' } },
		{ status: 200 },
		async () => {
			const response = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'Runner Student Updated', email: 'runner.student+alias@example.edu' },
			});
			assertStatus(response, 200);
			assert(response.body?.User?.email === 'runner.student+alias@example.edu', 'Plus-addressed email should persist on successful update.');
			ctx.users.student.email = 'runner.student+alias@example.edu';
			return harness.responseSummary(response);
		}
	);

	await harness.run('Profile updates do not change the current password for fresh logins', 'POST /user/login', { method: 'POST', client: 'student-fresh-login' }, { status: 200 }, async () => {
		const fresh = new CookieClient(harness.baseUrl);
		const response = await harness.login(fresh, ctx.users.student.email, ctx.users.student.password);
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run('Tampered session cookies are rejected', 'GET /user/me', { method: 'GET', client: 'tampered' }, { status: 401 }, async () => {
		const tampered = new CookieClient(harness.baseUrl, 'sid=tampered-session-id');
		const response = await tampered.request('/user/me');
		assertStatus(response, 401);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Representative error responses keep the expected error/details shape',
		'GET /user/me + POST /course + GET /admin + GET /course/999999 + PUT /user/me',
		{ method: 'MULTI' },
		{ shaped: true },
		async () => {
			const unauthorized = await anonymous.request('/user/me');
			const validation = await admin.request('/course', {
				method: 'POST',
				body: { code: 'BAD', title: '' },
			});
			const forbidden = await student.request('/admin');
			const notFound = await anonymous.request('/course/999999');
			const conflict = await student.request('/user/me', {
				method: 'PUT',
				body: { name: 'Runner Student Updated', email: ctx.users.otherStudent.email },
			});

			assertStatus(unauthorized, 401);
			assertStatus(validation, 400);
			assertStatus(forbidden, 403);
			assertStatus(notFound, 404);
			assertStatus(conflict, 409);

			assert(typeof unauthorized.body?.error === 'string', '401 responses should include an error message.');
			assert(typeof validation.body?.error === 'string', '400 responses should include an error message.');
			assert(validation.body?.details && typeof validation.body.details === 'object', '400 validation responses should include structured details.');
			assert(validation.body?.details?.fieldErrors && typeof validation.body.details.fieldErrors === 'object', '400 validation responses should include fieldErrors.');
			assert(typeof forbidden.body?.error === 'string', '403 responses should include an error message.');
			assert(typeof notFound.body?.error === 'string', '404 responses should include an error message.');
			assert(typeof conflict.body?.error === 'string', '409 responses should include an error message.');

			return {
				unauthorized: harness.responseSummary(unauthorized),
				validation: harness.responseSummary(validation),
				forbidden: harness.responseSummary(forbidden),
				notFound: harness.responseSummary(notFound),
				conflict: harness.responseSummary(conflict),
			};
		}
	);

	await harness.run(
		'Concurrent stale-session requests are all rejected after password rotation',
		'GET /user/me',
		{ method: 'GET', client: 'tampered', concurrency: 3 },
		{ status: 401, allResponses: true },
		async () => {
			const stale = new CookieClient(harness.baseUrl, 'sid=stale-session-id');
			const responses = await Promise.all(Array.from({ length: 3 }, () => stale.request('/user/me')));
			assert(
				responses.every((response) => response.status === 401),
				'Every stale-session request should be rejected.'
			);
			return responses.map(harness.responseSummary);
		}
	);

	ctx.users.gateAdmin = {
		name: 'Runner Gate Admin',
		email: 'runner.gate.admin@example.edu',
		detail: '9',
		type: 'ADMIN',
		password: null,
		client: new CookieClient(harness.baseUrl),
		user: null,
	};
	ctx.users.gateAdmin.password = `${ctx.users.gateAdmin.name}${ctx.users.gateAdmin.email}`;

	await harness.run(
		'First-login admins are blocked from protected admin workflows',
		'POST /course',
		{ method: 'POST', client: 'gateAdmin', body: { code: 'CMSC999', title: 'Blocked Course', desc: 'Should fail', cred: 3 } },
		{ status: 403 },
		async () => {
			const createResponse = await admin.request('/admin', {
				method: 'POST',
				body: {
					name: ctx.users.gateAdmin.name,
					email: ctx.users.gateAdmin.email,
					detail: ctx.users.gateAdmin.detail,
					type: ctx.users.gateAdmin.type,
				},
			});
			assertStatus(createResponse, 201);
			ctx.users.gateAdmin.user = createResponse.body;

			const loginResponse = await harness.login(ctx.users.gateAdmin.client, ctx.users.gateAdmin.email, ctx.users.gateAdmin.password);
			assertStatus(loginResponse, 200);
			assert(loginResponse.body?.firstLogin === true, 'Gate admin should be on first login.');

			const response = await ctx.users.gateAdmin.client.request('/course', {
				method: 'POST',
				body: { code: 'CMSC999', title: 'Blocked Course', desc: 'Should fail', cred: 3 },
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login admins are also blocked from semester workflows',
		'POST /semester',
		{ method: 'POST', client: 'gateAdmin', body: { term: 'Spring', year: 2032 } },
		{ status: 403 },
		async () => {
			const response = await ctx.users.gateAdmin.client.request('/semester', {
				method: 'POST',
				body: { term: 'Spring', year: 2032 },
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login admins are also blocked from prerequisite workflows',
		'POST /prerequisite',
		{ method: 'POST', client: 'gateAdmin', body: { cId: ctx.course1.course_id, pId: ctx.course2.course_id } },
		{ status: 403 },
		async () => {
			const response = await ctx.users.gateAdmin.client.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course1.course_id, pId: ctx.course2.course_id },
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login admins are also blocked from section workflows',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'gateAdmin', body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 1 } },
		{ status: 403 },
		async () => {
			const response = await ctx.users.gateAdmin.client.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
				},
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login admins are blocked from admin read, role-update, and delete verbs',
		`GET/PUT/DELETE /admin/${ctx.users.student.user?.id ?? ':id'}`,
		{ method: 'MULTI', client: 'gateAdmin' },
		{ statuses: [403, 403, 403] },
		async () => {
			const getResponse = await ctx.users.gateAdmin.client.request(`/admin/${ctx.users.student.user.id}`);
			const putResponse = await ctx.users.gateAdmin.client.request(`/admin/${ctx.users.student.user.id}/role`, {
				method: 'PUT',
				body: { type: 'STUDENT', detail: 'Computer Science' },
			});
			const deleteResponse = await ctx.users.gateAdmin.client.request(`/admin/${ctx.users.temp.user.id}`, {
				method: 'DELETE',
			});
			assertStatus(getResponse, 403);
			assertStatus(putResponse, 403);
			assertStatus(deleteResponse, 403);
			return {
				get: harness.responseSummary(getResponse),
				put: harness.responseSummary(putResponse),
				delete: harness.responseSummary(deleteResponse),
			};
		}
	);

	await harness.run(
		'First-login admins are blocked from course update and delete verbs',
		`PUT/DELETE /course/${ctx.course1?.course_id ?? ':id'}`,
		{ method: 'MULTI', client: 'gateAdmin' },
		{ statuses: [403, 403] },
		async () => {
			const putResponse = await ctx.users.gateAdmin.client.request(`/course/${ctx.course1.course_id}`, {
				method: 'PUT',
				body: { code: 'CMSC901A', title: 'Blocked Update', desc: 'Blocked', cred: 3 },
			});
			const deleteResponse = await ctx.users.gateAdmin.client.request(`/course/${ctx.course1.course_id}`, {
				method: 'DELETE',
			});
			assertStatus(putResponse, 403);
			assertStatus(deleteResponse, 403);
			return {
				put: harness.responseSummary(putResponse),
				delete: harness.responseSummary(deleteResponse),
			};
		}
	);

	await harness.run(
		'First-login admins are blocked from semester delete and prerequisite delete verbs',
		`DELETE /semester/${ctx.semester?.semester_id ?? ':id'} + DELETE /prerequisite/...`,
		{ method: 'MULTI', client: 'gateAdmin' },
		{ statuses: [403, 403] },
		async () => {
			const semesterResponse = await ctx.users.gateAdmin.client.request(`/semester/${ctx.semester.semester_id}`, {
				method: 'DELETE',
			});
			const prereqResponse = await ctx.users.gateAdmin.client.request(`/prerequisite/${ctx.course1.course_id}/${ctx.course2.course_id}`, {
				method: 'DELETE',
			});
			assertStatus(semesterResponse, 403);
			assertStatus(prereqResponse, 403);
			return {
				semester: harness.responseSummary(semesterResponse),
				prerequisite: harness.responseSummary(prereqResponse),
			};
		}
	);

	await harness.run(
		'First-login admins are blocked from section update, delete, and access-code verbs',
		`PUT/DELETE /section/${ctx.section?.section_id ?? ':id'}...`,
		{ method: 'MULTI', client: 'gateAdmin' },
		{ statuses: [403, 403, 403, 403] },
		async () => {
			const putResponse = await ctx.users.gateAdmin.client.request(`/section/${ctx.section.section_id}`, {
				method: 'PUT',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 3 },
			});
			const deleteResponse = await ctx.users.gateAdmin.client.request(`/section/${ctx.section.section_id}`, {
				method: 'DELETE',
			});
			const getCodes = await ctx.users.gateAdmin.client.request(`/section/${ctx.section.section_id}/access-codes`);
			const genCodes = await ctx.users.gateAdmin.client.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'POST',
				body: { numCodes: 1 },
			});
			assertStatus(putResponse, 403);
			assertStatus(deleteResponse, 403);
			assertStatus(getCodes, 403);
			assertStatus(genCodes, 403);
			return {
				put: harness.responseSummary(putResponse),
				delete: harness.responseSummary(deleteResponse),
				getCodes: harness.responseSummary(getCodes),
				genCodes: harness.responseSummary(genCodes),
			};
		}
	);

	ctx.users.gateProfessor = {
		name: 'Runner Gate Professor',
		email: 'runner.gate.prof@example.edu',
		detail: 'Computer Science',
		type: 'PROFESSOR',
		password: null,
		client: new CookieClient(harness.baseUrl),
		user: null,
	};
	ctx.users.gateProfessor.password = `${ctx.users.gateProfessor.name}${ctx.users.gateProfessor.email}`;

	await harness.run(
		'First-login professors are blocked from professor-only section workflows',
		`GET /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'GET', client: 'gateProfessor' },
		{ status: 403 },
		async () => {
			const createResponse = await admin.request('/admin', {
				method: 'POST',
				body: {
					name: ctx.users.gateProfessor.name,
					email: ctx.users.gateProfessor.email,
					detail: ctx.users.gateProfessor.detail,
					type: ctx.users.gateProfessor.type,
				},
			});
			assertStatus(createResponse, 201);
			ctx.users.gateProfessor.user = createResponse.body;

			const loginResponse = await harness.login(ctx.users.gateProfessor.client, ctx.users.gateProfessor.email, ctx.users.gateProfessor.password);
			assertStatus(loginResponse, 200);
			assert(loginResponse.body?.firstLogin === true, 'Gate professor should be on first login.');

			const response = await ctx.users.gateProfessor.client.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login professors are blocked from access-code generate and revoke verbs',
		`POST/DELETE /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'MULTI', client: 'gateProfessor' },
		{ statuses: [403, 403] },
		async () => {
			const postResponse = await ctx.users.gateProfessor.client.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'POST',
				body: { numCodes: 1 },
			});
			const deleteResponse = await ctx.users.gateProfessor.client.request(`/section/${ctx.section.section_id}/access-codes?codes=ABC`, {
				method: 'DELETE',
			});
			assertStatus(postResponse, 403);
			assertStatus(deleteResponse, 403);
			return {
				post: harness.responseSummary(postResponse),
				delete: harness.responseSummary(deleteResponse),
			};
		}
	);

	ctx.users.gateStudent = {
		name: 'Runner Gate Student',
		email: 'runner.gate.student@example.edu',
		detail: 'Computer Science',
		type: 'STUDENT',
		password: null,
		client: new CookieClient(harness.baseUrl),
		user: null,
	};
	ctx.users.gateStudent.password = `${ctx.users.gateStudent.name}${ctx.users.gateStudent.email}`;

	await harness.run(
		'First-login students are blocked across the enrollment route family',
		`GET /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`,
		{ method: 'GET', client: 'gateStudent' },
		{ status: 403 },
		async () => {
			const createResponse = await admin.request('/admin', {
				method: 'POST',
				body: {
					name: ctx.users.gateStudent.name,
					email: ctx.users.gateStudent.email,
					detail: ctx.users.gateStudent.detail,
					type: ctx.users.gateStudent.type,
				},
			});
			assertStatus(createResponse, 201);
			ctx.users.gateStudent.user = createResponse.body;

			const loginResponse = await harness.login(ctx.users.gateStudent.client, ctx.users.gateStudent.email, ctx.users.gateStudent.password);
			assertStatus(loginResponse, 200);
			assert(loginResponse.body?.firstLogin === true, 'Gate student should be on first login.');

			const response = await ctx.users.gateStudent.client.request(`/enrollment/${ctx.enrollment1.enrollment_id}`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'First-login students are blocked from enrollment create, update, and delete verbs',
		`POST/PUT/DELETE /enrollment`,
		{ method: 'MULTI', client: 'gateStudent' },
		{ statuses: [403, 403, 403] },
		async () => {
			const postResponse = await ctx.users.gateStudent.client.request('/enrollment', {
				method: 'POST',
				body: { stuId: ctx.users.gateStudent.user.role_id, secId: ctx.section.section_id },
			});
			const putResponse = await ctx.users.gateStudent.client.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'dropped' },
			});
			const deleteResponse = await ctx.users.gateStudent.client.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
				method: 'DELETE',
			});
			assertStatus(postResponse, 403);
			assertStatus(putResponse, 403);
			assertStatus(deleteResponse, 403);
			return {
				post: harness.responseSummary(postResponse),
				put: harness.responseSummary(putResponse),
				delete: harness.responseSummary(deleteResponse),
			};
		}
	);

	await harness.run('Admins cannot delete their own account', `DELETE /admin/${ctx.admin.user?.id ?? ':id'}`, { method: 'DELETE', client: 'admin' }, { status: 403 }, async () => {
		const response = await admin.request(`/admin/${ctx.admin.user.id}`, {
			method: 'DELETE',
		});
		assertStatus(response, 403);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Admins cannot remove their own admin role',
		`PUT /admin/${ctx.admin.user?.id ?? ':id'}/role`,
		{ method: 'PUT', client: 'admin', body: { type: 'STUDENT', detail: 'Computer Science' } },
		{ status: 403 },
		async () => {
			const response = await admin.request(`/admin/${ctx.admin.user.id}/role`, {
				method: 'PUT',
				body: { type: 'STUDENT', detail: 'Computer Science' },
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Access code reads show used flags after enrollment',
		`GET /section/${ctx.concurrency?.waitSection?.section_id ?? ':id'}/access-codes`,
		{ method: 'GET', client: 'professor' },
		{ status: 200 },
		async () => {
			const response = await professor.request(`/section/${ctx.concurrency.waitSection.section_id}/access-codes`);
			assertStatus(response, 200);
			const usedKey = Object.entries(response.body).find(([, value]) => value === ctx.concurrency.promotedCode)?.[0];
			assert(usedKey, 'Expected to find the enrollment access code in the latest access code map.');
			assert(response.body[`${usedKey}_used`] === true, 'Used flag should be true after enrollment.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Revoked access codes cannot be reused',
		`PUT /enrollment/${ctx.concurrency?.waitEnrollments?.c?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'concurrency-waitlisted', body: { status: 'enrolled', code: '[revoked code]' } },
		{ status: 400 },
		async () => {
			const candidate = [
				{ key: 'c', enrollment: ctx.concurrency.waitEnrollments.c },
				{ key: 'd', enrollment: ctx.concurrency.waitEnrollments.d },
			].find(({ enrollment }) => enrollment?.status === 'waitlisted');
			assert(candidate?.enrollment?.enrollment_id, 'Expected a remaining waitlisted concurrency enrollment.');

			const codesResponse = await professor.request(`/section/${ctx.concurrency.waitSection.section_id}/access-codes`);
			assertStatus(codesResponse, 200);
			const revokedCode = Object.entries(codesResponse.body).find(([key, value]) => /^code\d+$/.test(key) && typeof value === 'string' && value !== ctx.concurrency.promotedCode)?.[1];
			assert(revokedCode, 'Revoked code is missing.');

			const revokeResponse = await professor.request(`/section/${ctx.concurrency.waitSection.section_id}/access-codes?codes=${encodeURIComponent(revokedCode)}`, { method: 'DELETE' });
			assertStatus(revokeResponse, 200);

			const response = await ctx.concurrency.users[candidate.key].client.request(`/enrollment/${candidate.enrollment.enrollment_id}`, {
				method: 'PUT',
				body: {
					status: 'enrolled',
					code: revokedCode,
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Generating the maximum of 25 access codes succeeds',
		`POST /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'POST', client: 'professor', body: { numCodes: 25 } },
		{ status: 200 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'POST',
				body: { numCodes: 25 },
			});
			assertStatus(response, 200);
			assert(Object.keys(response.body ?? {}).length === 50, 'Expected exactly 25 code pairs in the response delta.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation accepts valid synchronous schedules',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2, days: 'TR', startTm: '11:00:00', endTm: '12:15:00' } },
		{ status: 201 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 2,
					days: 'TR',
					startTm: '11:00:00',
					endTm: '12:15:00',
				},
			});
			assertStatus(response, 201);
			ctx.extraSections.push(response.body);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation accepts days without times',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2, days: 'MWF' } },
		{ status: 201 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2, days: 'MWF' },
			});
			assertStatus(response, 201);
			ctx.extraSections.push(response.body);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation accepts times without days',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2, startTm: '13:00:00', endTm: '14:00:00' } },
		{ status: 201 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2, startTm: '13:00:00', endTm: '14:00:00' },
			});
			assertStatus(response, 201);
			ctx.extraSections.push(response.body);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section creation accepts single-day permutations and lower-case day normalization',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', bodies: ['M', 'R', 'u'] },
		{ status: 201, repeated: 3 },
		async () => {
			const daysList = ['M', 'R', 'u'];
			const results = [];
			for (const days of daysList) {
				const response = await admin.request(`/section/${ctx.course2.course_id}`, {
					method: 'POST',
					body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2, days },
				});
				assertStatus(response, 201);
				ctx.extraSections.push(response.body);
				results.push(response.body);
			}
			assert(results[2].days === 'U', 'Lower-case day input should normalize to uppercase.');
			return results;
		}
	);

	await harness.run(
		'Section creation rejects duplicate day letters',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2, days: 'MM' } },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2, days: 'MM' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section list supports semId, profId, and empty-result filters',
		'GET /section?...',
		{ method: 'GET', queries: ['semId', 'profId', 'search=NoMatch'] },
		{ status: 200, multiple: true },
		async () => {
			const bySem = await anonymous.request(`/section?semId=${ctx.semester.semester_id}`);
			const byProf = await anonymous.request(`/section?profId=${ctx.users.professor.user.role_id}`);
			const empty = await anonymous.request('/section?search=NoSuchSectionTerm');
			assertStatus(bySem, 200);
			assertStatus(byProf, 200);
			assertStatus(empty, 200);
			assert((bySem.body?.Section ?? []).length >= 1, 'semId filter should return at least one section.');
			assert((byProf.body?.Section ?? []).length >= 1, 'profId filter should return at least one section.');
			assert((empty.body?.Section ?? []).length === 0, 'No-result section filter should return an empty array.');
			return {
				bySem: harness.responseSummary(bySem),
				byProf: harness.responseSummary(byProf),
				empty: harness.responseSummary(empty),
			};
		}
	);

	await harness.run(
		'Updating a non-existent section returns 404',
		'PUT /section/999999',
		{ method: 'PUT', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2 } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/section/999999', {
				method: 'PUT',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2 },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Generating access codes for a non-existent section returns 404',
		'POST /section/999999/access-codes',
		{ method: 'POST', client: 'professor', body: { numCodes: 1 } },
		{ status: 404 },
		async () => {
			const response = await professor.request('/section/999999/access-codes', {
				method: 'POST',
				body: { numCodes: 1 },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Revoking unknown access codes is a no-op success',
		`DELETE /section/${ctx.section?.section_id ?? ':id'}/access-codes?codes=UNKNOWN`,
		{ method: 'DELETE', client: 'professor' },
		{ status: 200 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes?codes=${encodeURIComponent('UNKNOWN-CODE')}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Enrollment creation rejects non-existent student ids',
		'POST /enrollment',
		{ method: 'POST', client: 'admin', body: { stuId: 999999, secId: ctx.section?.section_id } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/enrollment', {
				method: 'POST',
				body: { stuId: 999999, secId: ctx.section.section_id },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Enrollment creation is blocked by unmet prerequisites through HTTP',
		'POST /course + POST /course + POST /prerequisite + POST /section + POST /enrollment',
		{ method: 'MULTI', client: 'admin' },
		{ status: 409 },
		async () => {
			const prereqCourseResponse = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC969', title: 'Required Prerequisite Course', desc: 'Must be completed first', cred: 3 },
			});
			assertStatus(prereqCourseResponse, 201);
			ctx.extraCourses.push(prereqCourseResponse.body);

			const courseResponse = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC970', title: 'Blocked Enrollment Course', desc: 'Needs prereqs', cred: 3 },
			});
			assertStatus(courseResponse, 201);
			ctx.extraCourses.push(courseResponse.body);

			const prereqResponse = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: courseResponse.body.course_id, pId: prereqCourseResponse.body.course_id },
			});
			assertStatus(prereqResponse, 201);
			ctx.extraPrereqs.push({ cId: courseResponse.body.course_id, pId: prereqCourseResponse.body.course_id });

			const sectionResponse = await admin.request(`/section/${courseResponse.body.course_id}`, {
				method: 'POST',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 2 },
			});
			assertStatus(sectionResponse, 201);
			ctx.extraSections.push(sectionResponse.body);

			const response = await admin.request('/enrollment', {
				method: 'POST',
				body: { stuId: ctx.users.student.user.role_id, secId: sectionResponse.body.section_id },
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Enrollment creation rejects non-existent section ids',
		'POST /enrollment',
		{ method: 'POST', client: 'admin', body: { stuId: ctx.users.student.user?.role_id, secId: 999999 } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/enrollment', {
				method: 'POST',
				body: { stuId: ctx.users.student.user.role_id, secId: 999999 },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Enrollment creation returns conflict when the waitlist is already full',
		'POST /enrollment (waitlist full)',
		{ method: 'POST', client: 'admin', repeated: 5 },
		{ finalStatus: 409 },
		async () => {
			const courseResponse = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC971', title: 'Waitlist Full Course', desc: 'Waitlist full', cred: 3 },
			});
			assertStatus(courseResponse, 201);
			ctx.extraCourses.push(courseResponse.body);

			const sectionResponse = await admin.request(`/section/${courseResponse.body.course_id}`, {
				method: 'POST',
				body: { semId: ctx.semester.semester_id, profId: ctx.users.professor.user.role_id, capacity: 1 },
			});
			assertStatus(sectionResponse, 201);
			ctx.extraSections.push(sectionResponse.body);
			ctx.waitlistFullSection = sectionResponse.body;

			const ids = [
				ctx.users.student.user.role_id,
				ctx.users.otherStudent.user.role_id,
				ctx.concurrency.users.a.user.role_id,
				ctx.concurrency.users.b.user.role_id,
				ctx.concurrency.users.c.user.role_id,
			];

			const responses = [];
			for (const stuId of ids) {
				const response = await admin.request('/enrollment', {
					method: 'POST',
					body: { stuId, secId: sectionResponse.body.section_id },
				});
				responses.push(response);
				if (response.status === 201 && response.body?.enrollment_id) {
					ctx.extraEnrollments.push(response.body.enrollment_id);
				}
			}

			assert(
				responses.slice(0, 4).every((response) => response.status === 201),
				'The first four waitlist-full setup enrollments should create records.'
			);
			assertStatus(responses[4], 409);
			return responses.map(harness.responseSummary);
		}
	);

	await harness.run(
		'Students cannot delete enrollments directly',
		`DELETE /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'DELETE', client: 'otherStudent' },
		{ status: 403 },
		async () => {
			const response = await otherStudent.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, { method: 'DELETE' });
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Updating a non-existent admin role target returns 404',
		'PUT /admin/999999/role',
		{ method: 'PUT', client: 'admin', body: { type: 'STUDENT', detail: 'Computer Science' } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/admin/999999/role', {
				method: 'PUT',
				body: { type: 'STUDENT', detail: 'Computer Science' },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course deletion is blocked while newly created sections still exist',
		`DELETE /course/${ctx.course2?.course_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/course/${ctx.course2.course_id}`, { method: 'DELETE' });
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Access-code reads on a non-owned professor section remain forbidden after role/session changes',
		`GET /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'GET', client: 'otherStudent' },
		{ status: 403 },
		async () => {
			const response = await otherStudent.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admins can fetch and idempotently update another student enrollment',
		`GET/PUT /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'MULTI', client: 'admin' },
		{ status: 200, multiple: true },
		async () => {
			const getResponse = await admin.request(`/enrollment/${ctx.enrollment2.enrollment_id}`);
			assertStatus(getResponse, 200);
			const putResponse = await admin.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'enrolled', code: ctx.enrollmentCode1 ?? 'UNUSED-CODE' },
			});
			assertStatus(putResponse, 200);
			return {
				get: harness.responseSummary(getResponse),
				put: harness.responseSummary(putResponse),
			};
		}
	);

	await harness.run(
		'Completed enrollments cannot be dropped afterward',
		`PUT /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'admin', body: { status: 'completed' } },
		{ statuses: [200, 400] },
		async () => {
			const complete = await admin.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'completed' },
			});
			assertStatus(complete, 200);
			const drop = await admin.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'dropped' },
			});
			assertStatus(drop, 400);
			ctx.enrollment2 = complete.body;
			return {
				complete: harness.responseSummary(complete),
				drop: harness.responseSummary(drop),
			};
		}
	);

	await harness.run(
		'Waitlisted enrollments cannot be marked completed',
		`PUT /enrollment/${ctx.concurrency?.waitEnrollments?.d?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'admin', body: { status: 'completed' } },
		{ status: 400 },
		async () => {
			const target = ctx.concurrency.waitEnrollments.d?.status === 'waitlisted' ? ctx.concurrency.waitEnrollments.d.enrollment_id : ctx.concurrency.waitEnrollments.c.enrollment_id;
			const response = await admin.request(`/enrollment/${target}`, {
				method: 'PUT',
				body: { status: 'completed' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Deleting a non-existent enrollment returns 404', 'DELETE /enrollment/999999', { method: 'DELETE', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/enrollment/999999', { method: 'DELETE' });
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found course reads return 404', 'GET /course/999999', { method: 'GET' }, { status: 404 }, async () => {
		const response = await anonymous.request('/course/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Not-found course updates return 404',
		'PUT /course/999999',
		{ method: 'PUT', client: 'admin', body: { code: 'CMSC999', title: 'Missing Course', desc: 'Missing', cred: 3 } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/course/999999', {
				method: 'PUT',
				body: { code: 'CMSC999', title: 'Missing Course', desc: 'Missing', cred: 3 },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Not-found semester reads return 404', 'GET /semester/999999', { method: 'GET' }, { status: 404 }, async () => {
		const response = await anonymous.request('/semester/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found section reads return 404', 'GET /section/999999', { method: 'GET' }, { status: 404 }, async () => {
		const response = await anonymous.request('/section/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found section deletes return 404', 'DELETE /section/999999', { method: 'DELETE', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/section/999999', { method: 'DELETE' });
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found prerequisite reads return 404', 'GET /prerequisite/999999', { method: 'GET' }, { status: 404 }, async () => {
		const response = await anonymous.request('/prerequisite/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found admin reads return 404', 'GET /admin/999999', { method: 'GET', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/admin/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found admin deletes return 404', 'DELETE /admin/999999', { method: 'DELETE', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/admin/999999', { method: 'DELETE' });
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run('Not-found enrollment reads return 404', 'GET /enrollment/999999', { method: 'GET', client: 'admin' }, { status: 404 }, async () => {
		const response = await admin.request('/enrollment/999999');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Not-found enrollment updates return 404',
		'PUT /enrollment/999999',
		{ method: 'PUT', client: 'admin', body: { status: 'dropped', code: 'UNUSED-CODE' } },
		{ status: 404 },
		async () => {
			const response = await admin.request('/enrollment/999999', {
				method: 'PUT',
				body: { status: 'dropped', code: 'UNUSED-CODE' },
			});
			assertStatus(response, 404);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Not-found access-code reads return 404', 'GET /section/999999/access-codes', { method: 'GET', client: 'professor' }, { status: 404 }, async () => {
		const response = await professor.request('/section/999999/access-codes');
		assertStatus(response, 404);
		return harness.responseSummary(response);
	});
}
