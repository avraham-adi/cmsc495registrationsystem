import * as db from '../../../backend/src/db/connection.js';
import { assert, assertStatus } from '../shared.js';

export async function runCleanupSuite(env) {
	const { harness, clients, ctx } = env;
	const { admin, student } = clients;

	await harness.run('Admins can remove enrollment records', `DELETE /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`, { method: 'DELETE', client: 'admin' }, { status: 200 }, async () => {
		const response = await admin.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
			method: 'DELETE',
		});
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Admins can remove concurrency enrollments during cleanup',
		'DELETE /enrollment/:id (concurrency)',
		{ method: 'DELETE', client: 'admin' },
		{ status: 200, multiple: true },
		async () => {
			const ids = [];
			for (const entry of [ctx.concurrency?.raceResults?.a?.body, ctx.concurrency?.raceResults?.b?.body, ctx.concurrency?.raceResults?.c?.body]) {
				if (entry?.enrollment_id) ids.push(entry.enrollment_id);
			}
			if (ctx.concurrency?.waitEnrollments?.a?.enrollment_id) ids.push(ctx.concurrency.waitEnrollments.a.enrollment_id);
			if (ctx.concurrency?.waitEnrollments?.b?.enrollment_id) ids.push(ctx.concurrency.waitEnrollments.b.enrollment_id);
			if (ctx.concurrency?.waitEnrollments?.c?.enrollment_id) ids.push(ctx.concurrency.waitEnrollments.c.enrollment_id);
			if (ctx.concurrency?.waitEnrollments?.d?.enrollment_id) ids.push(ctx.concurrency.waitEnrollments.d.enrollment_id);
			for (const id of ctx.extraEnrollments ?? []) ids.push(id);

			const responses = [];
			for (const id of [...new Set(ids)]) {
				const response = await admin.request(`/enrollment/${id}`, { method: 'DELETE' });
				if (response.status === 200 || response.status === 404) {
					responses.push({ id, status: response.status });
					continue;
				}
				assertStatus(response, 200);
			}

			return responses;
		}
	);

	await harness.run(
		'Admins can remove the second enrollment record',
		`DELETE /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Concurrency sections and course can be deleted after cleanup',
		'DELETE /section/:id + DELETE /course/:id (concurrency)',
		{ method: 'DELETE', client: 'admin' },
		{ status: 200, multiple: true },
		async () => {
			const extras = [];
			for (const section of ctx.extraSections ?? []) {
				const response = await admin.request(`/section/${section.section_id}`, { method: 'DELETE' });
				if (response.status === 200 || response.status === 404) {
					extras.push({ id: section.section_id, status: response.status });
					continue;
				}
				assertStatus(response, 200);
			}
			const sectionRace = await admin.request(`/section/${ctx.concurrency.raceSection.section_id}`, { method: 'DELETE' });
			assertStatus(sectionRace, 200);
			const sectionWait = await admin.request(`/section/${ctx.concurrency.waitSection.section_id}`, { method: 'DELETE' });
			assertStatus(sectionWait, 200);
			for (const courseRow of ctx.extraCourses ?? []) {
				const response = await admin.request(`/course/${courseRow.course_id}`, { method: 'DELETE' });
				if (response.status === 200 || response.status === 404) {
					extras.push({ id: courseRow.course_id, status: response.status });
					continue;
				}
				assertStatus(response, 200);
			}
			const course = await admin.request(`/course/${ctx.concurrency.course.course_id}`, { method: 'DELETE' });
			assertStatus(course, 200);

			return {
				extras,
				raceSection: { status: sectionRace.status },
				waitSection: { status: sectionWait.status },
				course: { status: course.status },
			};
		}
	);

	await harness.run(
		'Sections can be deleted after enrollments are removed',
		`DELETE /section/${ctx.section?.section_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/section/${ctx.section.section_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Semesters can be deleted after dependent sections are removed',
		`DELETE /semester/${ctx.semester?.semester_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/semester/${ctx.semester.semester_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	if (ctx.extraSemester?.semester_id) {
		await harness.run(
			'Additional boundary-test semesters can also be deleted during cleanup',
			`DELETE /semester/${ctx.extraSemester.semester_id}`,
			{ method: 'DELETE', client: 'admin' },
			{ status: 200 },
			async () => {
				const response = await admin.request(`/semester/${ctx.extraSemester.semester_id}`, {
					method: 'DELETE',
				});
				assertStatus(response, 200);
				return harness.responseSummary(response);
			}
		);
	}

	if ((ctx.extraSemesters ?? []).length > 0) {
		await harness.run(
			'Additional semesters created by edge tests can be deleted during cleanup',
			'DELETE /semester/:id (extra)',
			{ method: 'DELETE', client: 'admin' },
			{ status: 200, multiple: true },
			async () => {
				const results = [];
				for (const semester of ctx.extraSemesters) {
					const response = await admin.request(`/semester/${semester.semester_id}`, { method: 'DELETE' });
					if (response.status === 200 || response.status === 404) {
						results.push({ id: semester.semester_id, status: response.status });
						continue;
					}
					assertStatus(response, 200);
				}
				return results;
			}
		);
	}

	await harness.run(
		'Prerequisites can be deleted',
		`DELETE /prerequisite/${ctx.course1?.course_id ?? ':cId'}/${ctx.course2?.course_id ?? ':pId'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const extras = [];
			for (const pair of ctx.extraPrereqs ?? []) {
				const response = await admin.request(`/prerequisite/${pair.cId}/${pair.pId}`, { method: 'DELETE' });
				if (response.status === 200 || response.status === 404) {
					extras.push({ ...pair, status: response.status });
					continue;
				}
				assertStatus(response, 200);
			}
			const response = await admin.request(`/prerequisite/${ctx.course1.course_id}/${ctx.course2.course_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return {
				extras,
				main: harness.responseSummary(response),
			};
		}
	);

	await harness.run(
		'Courses can be deleted once prerequisites and sections are gone',
		`DELETE /course/${ctx.course2?.course_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/course/${ctx.course2.course_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Primary course can also be deleted after cleanup', `DELETE /course/${ctx.course1?.course_id ?? ':id'}`, { method: 'DELETE', client: 'admin' }, { status: 200 }, async () => {
		const response = await admin.request(`/course/${ctx.course1.course_id}`, {
			method: 'DELETE',
		});
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run('Admins can delete temporary users during cleanup', `DELETE /admin/${ctx.users.temp.user?.id ?? ':id'}`, { method: 'DELETE', client: 'admin' }, { status: 200 }, async () => {
		await db.query('DELETE FROM sessions WHERE user_id = ?', [ctx.users.temp.user.id]);
		const response = await admin.request(`/admin/${ctx.users.temp.user.id}`, {
			method: 'DELETE',
		});
		assertStatus(response, 200);
		return harness.responseSummary(response);
	});

	await harness.run(
		'Admins can delete first-login gate users during cleanup',
		`DELETE /admin/${ctx.users.gateAdmin?.user?.id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 200 },
		async () => {
			const userIds = [
				...Object.values(ctx.concurrency.users).map((user) => user.user.id),
				ctx.users.gateAdmin.user.id,
				ctx.users.gateProfessor.user.id,
				...(ctx.users.gateStudent?.user?.id ? [ctx.users.gateStudent.user.id] : []),
				...(ctx.extraUsers ?? []).map((user) => user.id),
			];
			await db.query(`DELETE FROM sessions WHERE user_id IN (${userIds.map(() => '?').join(', ')})`, userIds);

			for (const user of Object.values(ctx.concurrency.users)) {
				const response = await admin.request(`/admin/${user.user.id}`, { method: 'DELETE' });
				assertStatus(response, 200);
			}

			const first = await admin.request(`/admin/${ctx.users.gateAdmin.user.id}`, { method: 'DELETE' });
			assertStatus(first, 200);

			const second = await admin.request(`/admin/${ctx.users.gateProfessor.user.id}`, { method: 'DELETE' });
			assertStatus(second, 200);

			let third = null;
			if (ctx.users.gateStudent?.user?.id) {
				third = await admin.request(`/admin/${ctx.users.gateStudent.user.id}`, { method: 'DELETE' });
				assertStatus(third, 200);
			}

			const extraUsers = [];
			for (const user of ctx.extraUsers ?? []) {
				const response = await admin.request(`/admin/${user.id}`, { method: 'DELETE' });
				if (response.status === 200 || response.status === 404) {
					extraUsers.push({ id: user.id, status: response.status });
					continue;
				}
				assertStatus(response, 200);
			}

			return {
				concurrencyUsers: Object.values(ctx.concurrency.users).map((user) => ({ id: user.user.id, status: 200 })),
				gateAdmin: { status: first.status },
				gateProfessor: { status: second.status },
				...(third ? { gateStudent: { status: third.status } } : {}),
				extraUsers,
			};
		}
	);

	if (ctx.users.boundaryUser?.id) {
		await harness.run('Boundary-test users can be deleted during cleanup', `DELETE /admin/${ctx.users.boundaryUser.id}`, { method: 'DELETE', client: 'admin' }, { status: 200 }, async () => {
			const response = await admin.request(`/admin/${ctx.users.boundaryUser.id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 200);
			return harness.responseSummary(response);
		});
	}

	await harness.run('Admin logout clears the active session', 'GET /user/logout', { method: 'GET', client: 'admin' }, { status: 200 }, async () => {
		const response = await admin.request('/user/logout');
		assertStatus(response, 200);
		assert(typeof response.headers['set-cookie'] === 'string' && response.headers['set-cookie'].includes('sid='), 'Admin logout should emit a clearing Set-Cookie header.');
		admin.clear();
		return harness.responseSummary(response);
	});

	await harness.run('Student can still log out after the protected workflow completes', 'GET /user/logout', { method: 'GET', client: 'student' }, { status: 200 }, async () => {
		const response = await student.request('/user/logout');
		assertStatus(response, 200);
		assert(typeof response.headers['set-cookie'] === 'string' && response.headers['set-cookie'].includes('sid='), 'Student logout should emit a clearing Set-Cookie header.');
		student.clear();
		return harness.responseSummary(response);
	});

	await harness.run('Logged-out admin sessions cannot access /user/me', 'GET /user/me', { method: 'GET', client: 'admin' }, { status: 401 }, async () => {
		const response = await admin.request('/user/me');
		assertStatus(response, 401);
		return harness.responseSummary(response);
	});
}
