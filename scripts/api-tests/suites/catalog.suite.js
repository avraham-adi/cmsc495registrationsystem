import { assert, assertStatus, findFirstCode } from '../shared.js';

export async function runCatalogSuite(env) {
	const { harness, clients, ctx } = env;
	const { anonymous, admin, professor, student } = clients;

	await harness.run('Course creation validates request bodies', 'POST /course', { method: 'POST', client: 'admin', body: { code: 'CMSC900', title: 'Broken' } }, { status: 400 }, async () => {
		const response = await admin.request('/course', {
			method: 'POST',
			body: { code: 'CMSC900', title: 'Broken' },
		});
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Admin can create the first course',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC901', title: 'Runner Course One', desc: 'Primary test course', cred: 3 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC901', title: 'Runner Course One', desc: 'Primary test course', cred: 3 },
			});
			assertStatus(response, 201);
			ctx.course1 = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Course creation rejects duplicate course codes',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC901', title: 'Runner Course One', desc: 'Duplicate', cred: 3 } },
		{ status: 409 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC901', title: 'Runner Course One', desc: 'Duplicate', cred: 3 },
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admin can create the second course',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC902', title: 'Runner Course Two', desc: 'Secondary test course', cred: 4 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC902', title: 'Runner Course Two', desc: 'Secondary test course', cred: 4 },
			});
			assertStatus(response, 201);
			ctx.course2 = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Public course list supports subject filters',
		'GET /course?page=1&limit=100&subject=CMSC&search=Runner',
		{ method: 'GET', query: { page: 1, limit: 100, subject: 'CMSC', search: 'Runner' } },
		{ status: 200, bodyKeys: ['Course', 'Meta'] },
		async () => {
			const response = await anonymous.request('/course?page=1&limit=100&subject=CMSC&search=Runner');
			assertStatus(response, 200);
			assert(Array.isArray(response.body?.Course), 'Course list must be an array.');
			assert(
				response.body.Course.some((entry) => entry.Course.course_id === ctx.course1.course_id),
				'Course list is missing course1.'
			);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Public course list rejects invalid subject filters', 'GET /course?subject=ZZZZ', { method: 'GET', query: { subject: 'ZZZZ' } }, { status: 400 }, async () => {
		const response = await anonymous.request('/course?subject=ZZZZ');
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run('Public course reads return a single course', `GET /course/${ctx.course1?.course_id ?? ':id'}`, { method: 'GET' }, { status: 200 }, async () => {
		const response = await anonymous.request(`/course/${ctx.course1.course_id}`);
		assertStatus(response, 200);
		assert(response.body?.course_code === 'CMSC901', 'Course read returned the wrong course.');
		return harness.responseSummary(response);
	});

	await harness.run(
		'Admin can update an existing course',
		`PUT /course/${ctx.course1?.course_id ?? ':id'}`,
		{ method: 'PUT', client: 'admin', body: { code: 'CMSC901A', title: 'Runner Course One Updated', desc: 'Updated course', cred: 3 } },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/course/${ctx.course1.course_id}`, {
				method: 'PUT',
				body: { code: 'CMSC901A', title: 'Runner Course One Updated', desc: 'Updated course', cred: 3 },
			});
			assertStatus(response, 200);
			assert(response.body?.course_code === 'CMSC901A', 'Course update did not persist the new code.');
			ctx.course1 = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Prerequisite creation rejects self-references',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { cId: ctx.course1?.course_id, pId: ctx.course1?.course_id } },
		{ status: 400 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course1.course_id, pId: ctx.course1.course_id },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admin can create a prerequisite relationship',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { cId: ctx.course1?.course_id, pId: ctx.course2?.course_id } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course1.course_id, pId: ctx.course2.course_id },
			});
			assertStatus(response, 201);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Prerequisite creation rejects duplicates',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { cId: ctx.course1?.course_id, pId: ctx.course2?.course_id } },
		{ status: 409 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course1.course_id, pId: ctx.course2.course_id },
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Prerequisite creation rejects cycles',
		'POST /prerequisite',
		{ method: 'POST', client: 'admin', body: { cId: ctx.course2?.course_id, pId: ctx.course1?.course_id } },
		{ status: 409 },
		async () => {
			const response = await admin.request('/prerequisite', {
				method: 'POST',
				body: { cId: ctx.course2.course_id, pId: ctx.course1.course_id },
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Public prerequisite reads return wrapped prerequisite items', `GET /prerequisite/${ctx.course1?.course_id ?? ':id'}`, { method: 'GET' }, { status: 200 }, async () => {
		const response = await anonymous.request(`/prerequisite/${ctx.course1.course_id}`);
		assertStatus(response, 200);
		assert(Array.isArray(response.body), 'Prerequisite list must be an array.');
		assert(
			response.body.some((entry) => entry.Prerequisite.courseId === ctx.course2.course_id),
			'Prerequisite list is missing course2.'
		);
		return harness.responseSummary(response);
	});

	await harness.run('Semester creation validates request bodies', 'POST /semester', { method: 'POST', client: 'admin', body: { term: 'Fall' } }, { status: 400 }, async () => {
		const response = await admin.request('/semester', {
			method: 'POST',
			body: { term: 'Fall' },
		});
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});

	await harness.run('Admin can create a semester', 'POST /semester', { method: 'POST', client: 'admin', body: { term: 'Winter', year: 2030 } }, { status: 201 }, async () => {
		const response = await admin.request('/semester', {
			method: 'POST',
			body: { term: 'Winter', year: 2030 },
		});
		assertStatus(response, 201);
		ctx.semester = response.body;
		return harness.responseSummary(response);
	});

	await harness.run('Semester creation rejects duplicates', 'POST /semester', { method: 'POST', client: 'admin', body: { term: 'Winter', year: 2030 } }, { status: 409 }, async () => {
		const response = await admin.request('/semester', {
			method: 'POST',
			body: { term: 'Winter', year: 2030 },
		});
		assertStatus(response, 409);
		return harness.responseSummary(response);
	});

	await harness.run('Public semester list returns array-wrapped semesters', 'GET /semester', { method: 'GET' }, { status: 200 }, async () => {
		const response = await anonymous.request('/semester');
		assertStatus(response, 200);
		assert(Array.isArray(response.body), 'Semester list must be an array.');
		assert(
			response.body.some((entry) => entry.Semester.semester_id === ctx.semester.semester_id),
			'Semester list is missing the created semester.'
		);
		return harness.responseSummary(response);
	});

	await harness.run('Public semester reads return a single semester', `GET /semester/${ctx.semester?.semester_id ?? ':id'}`, { method: 'GET' }, { status: 200 }, async () => {
		const response = await anonymous.request(`/semester/${ctx.semester.semester_id}`);
		assertStatus(response, 200);
		assert(response.body?.term === 'Winter', 'Semester read returned the wrong semester.');
		return harness.responseSummary(response);
	});

	await harness.run(
		'Section creation enforces paired time validation',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1, startTm: '09:00:00' } },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
					startTm: '09:00:00',
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Admin can create an async section',
		`POST /section/${ctx.course2?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1 } },
		{ status: 201, days: 'async' },
		async () => {
			const response = await admin.request(`/section/${ctx.course2.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
				},
			});
			assertStatus(response, 201);
			ctx.section = response.body;
			assert(response.body?.days === 'async', 'Async section should default to days=async.');
			assert(response.body?.start_time === '', 'Async section should default to empty start_time.');
			assert(response.body?.end_time === '', 'Async section should default to empty end_time.');
			return harness.responseSummary(response);
		}
	);

	await harness.run('Public section reads return a single section', `GET /section/${ctx.section?.section_id ?? ':id'}`, { method: 'GET' }, { status: 200 }, async () => {
		const response = await anonymous.request(`/section/${ctx.section.section_id}`);
		assertStatus(response, 200);
		assert(response.body?.section_id === ctx.section.section_id, 'Section read returned the wrong section.');
		return harness.responseSummary(response);
	});

	await harness.run(
		'Public section list supports filters',
		`GET /section?page=1&limit=10&crsId=${ctx.course2?.course_id ?? ':crsId'}`,
		{ method: 'GET', query: { page: 1, limit: 10, crsId: ctx.course2?.course_id } },
		{ status: 200, bodyKeys: ['Section', 'Meta'] },
		async () => {
			const response = await anonymous.request(`/section?page=1&limit=10&crsId=${ctx.course2.course_id}`);
			assertStatus(response, 200);
			assert(Array.isArray(response.body?.Section), 'Section list must be an array.');
			assert(
				response.body.Section.some((entry) => entry.Section.section_id === ctx.section.section_id),
				'Section list is missing the created section.'
			);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Concurrent public section reads succeed',
		`GET /section/${ctx.section?.section_id ?? ':id'}`,
		{ method: 'GET', concurrency: 5 },
		{ status: 200, allResponses: true },
		async () => {
			const responses = await Promise.all(Array.from({ length: 5 }, () => anonymous.request(`/section/${ctx.section.section_id}`)));
			assert(
				responses.every((response) => response.status === 200),
				'At least one concurrent section read failed.'
			);
			return responses.map(harness.responseSummary);
		}
	);

	await harness.run(
		'Professors can read access codes for their own sections',
		`GET /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'GET', client: 'professor' },
		{ status: 200 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(response, 200);
			ctx.accessCodes = response.body;
			assert(findFirstCode(response.body), 'Section access codes should include at least one code.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Access code generation validates its maximum size',
		`POST /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'POST', client: 'professor', body: { numCodes: 26 } },
		{ status: 400 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'POST',
				body: { numCodes: 26 },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Professors can generate additional access codes',
		`POST /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'POST', client: 'professor', body: { numCodes: 2 } },
		{ status: 200 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'POST',
				body: { numCodes: 2 },
			});
			assertStatus(response, 200);
			ctx.extraCodes = response.body;
			assert(Object.keys(response.body ?? {}).length >= 4, 'Expected generated access-code pairs.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Students cannot access professor/admin section code routes',
		`GET /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'GET', client: 'student' },
		{ status: 403 },
		async () => {
			const response = await student.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Access code revocation requires a query string',
		`DELETE /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'DELETE', client: 'professor' },
		{ status: 400 },
		async () => {
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes`, {
				method: 'DELETE',
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Professors can revoke generated access codes',
		`DELETE /section/${ctx.section?.section_id ?? ':id'}/access-codes?codes=...`,
		{ method: 'DELETE', client: 'professor', query: { codes: Object.values(ctx.extraCodes ?? {}).join(',') } },
		{ status: 200 },
		async () => {
			const code = findFirstCode(ctx.extraCodes);
			assert(code, 'Generated access code is missing.');
			const response = await professor.request(`/section/${ctx.section.section_id}/access-codes?codes=${encodeURIComponent(code)}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);
}
