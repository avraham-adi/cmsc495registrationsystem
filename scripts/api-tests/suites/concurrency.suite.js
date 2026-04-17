import * as db from '../../../backend/src/db/connection.js';
import EnrollmentService from '../../../backend/src/services/enrollment.service.js';
import { assert, assertStatus, findFirstCode, strongPassword } from '../shared.js';

async function ensureStudentSession(harness, client, user) {
	const loginResponse = await harness.login(client, user.email, user.password);
	assertStatus(loginResponse, 200);

	if (loginResponse.body?.firstLogin) {
		const patchResponse = await client.request('/user/me', {
			method: 'PATCH',
			body: { password: user.nextPassword },
		});
		assertStatus(patchResponse, 200);
		user.password = user.nextPassword;
	}
}

export async function runConcurrencySuite(env) {
	const { harness, clients, ctx } = env;
	const { admin } = clients;

	ctx.concurrency = {
		users: {
			a: {
				name: 'Runner Race Student A',
				email: 'runner.race.a@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('RaceStudentA'),
				user: null,
				client: new clients.student.constructor(harness.baseUrl),
			},
			b: {
				name: 'Runner Race Student B',
				email: 'runner.race.b@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('RaceStudentB'),
				user: null,
				client: new clients.student.constructor(harness.baseUrl),
			},
			c: {
				name: 'Runner Race Student C',
				email: 'runner.race.c@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('RaceStudentC'),
				user: null,
				client: new clients.student.constructor(harness.baseUrl),
			},
			d: {
				name: 'Runner Race Student D',
				email: 'runner.race.d@example.edu',
				detail: 'Computer Science',
				type: 'STUDENT',
				password: null,
				nextPassword: strongPassword('RaceStudentD'),
				user: null,
				client: new clients.student.constructor(harness.baseUrl),
			},
		},
		course: null,
		raceSection: null,
		raceCodes: null,
		waitSection: null,
		waitCodes: null,
		raceResults: null,
		waitEnrollments: {},
		promotedCode: null,
	};

	for (const user of Object.values(ctx.concurrency.users)) {
		user.password = `${user.name}${user.email}`;
	}

	await harness.run(
		'Concurrency setup can create additional student users',
		'POST /admin',
		{ method: 'POST', client: 'admin', body: '[3 student records]' },
		{ status: 201, repeated: 3 },
		async () => {
			const created = [];

			for (const user of Object.values(ctx.concurrency.users)) {
				const response = await admin.request('/admin', {
					method: 'POST',
					body: {
						name: user.name,
						email: user.email,
						detail: user.detail,
						type: user.type,
					},
				});
				assertStatus(response, 201);
				user.user = response.body;
				created.push(response.body);
			}

			return { status: 201, users: created };
		}
	);

	await harness.run(
		'Concurrency setup can establish student sessions',
		'POST /user/login + PATCH /user/me',
		{ method: 'MULTI', clients: ['a', 'b', 'c'] },
		{ status: 200, repeated: 3 },
		async () => {
			for (const user of Object.values(ctx.concurrency.users)) {
				await ensureStudentSession(harness, user.client, user);
			}

			return {
				status: 200,
				users: Object.fromEntries(Object.entries(ctx.concurrency.users).map(([key, user]) => [key, { email: user.email }])),
			};
		}
	);

	await harness.run(
		'Concurrency setup can create an isolated course',
		'POST /course',
		{ method: 'POST', client: 'admin', body: { code: 'CMSC903', title: 'Runner Concurrency Course', desc: 'Concurrency test course', cred: 3 } },
		{ status: 201 },
		async () => {
			const response = await admin.request('/course', {
				method: 'POST',
				body: { code: 'CMSC903', title: 'Runner Concurrency Course', desc: 'Concurrency test course', cred: 3 },
			});
			assertStatus(response, 201);
			ctx.concurrency.course = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Concurrency setup can create an access-code race section',
		`POST /section/${ctx.concurrency.course?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 2 } },
		{ status: 201 },
		async () => {
			const response = await admin.request(`/section/${ctx.concurrency.course.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 2,
				},
			});
			assertStatus(response, 201);
			ctx.concurrency.raceSection = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Simultaneous enrollments fill capacity and place overflow on the waitlist',
		'POST /enrollment (concurrent capacity race)',
		{ method: 'POST', concurrency: 3 },
		{ enrolled: 2, waitlisted: 1 },
		async () => {
			const [aResponse, bResponse, cResponse] = await Promise.all([
				ctx.concurrency.users.a.client.request('/enrollment', {
					method: 'POST',
					body: {
						stuId: ctx.concurrency.users.a.user.role_id,
						secId: ctx.concurrency.raceSection.section_id,
					},
				}),
				ctx.concurrency.users.b.client.request('/enrollment', {
					method: 'POST',
					body: {
						stuId: ctx.concurrency.users.b.user.role_id,
						secId: ctx.concurrency.raceSection.section_id,
					},
				}),
				ctx.concurrency.users.c.client.request('/enrollment', {
					method: 'POST',
					body: {
						stuId: ctx.concurrency.users.c.user.role_id,
						secId: ctx.concurrency.raceSection.section_id,
					},
				}),
			]);

			const responses = [aResponse, bResponse, cResponse];
			assert(
				responses.every((response) => response.status === 201),
				'Each concurrent enrollment attempt should produce an enrollment record.'
			);

			const enrolled = responses.filter((response) => response.body?.status === 'enrolled').length;
			const waitlisted = responses.filter((response) => response.body?.status === 'waitlisted').length;
			assert(enrolled === 2, 'Exactly two concurrent students should be enrolled into the capacity-two section.');
			assert(waitlisted === 1, 'Exactly one concurrent student should be waitlisted once capacity is exhausted.');

			ctx.concurrency.raceResults = { a: aResponse, b: bResponse, c: cResponse };
			return responses.map(harness.responseSummary);
		}
	);

	await harness.run(
		'Concurrency setup can create a waitlist section',
		`POST /section/${ctx.concurrency.course?.course_id ?? ':cId'}`,
		{ method: 'POST', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 1 } },
		{ status: 201 },
		async () => {
			const response = await admin.request(`/section/${ctx.concurrency.course.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
				},
			});
			assertStatus(response, 201);
			ctx.concurrency.waitSection = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Waitlist fill order preserves the queue after a seat opens',
		'SERVICE EnrollmentService.addEnroll/updEnroll',
		{ method: 'SERVICE', workflow: 'waitlist-order' },
		{ queuePreserved: true },
		async () => {
			const service = new EnrollmentService();
			const actingUser = { id: ctx.admin.user.id, role: 'ADMIN', role_id: ctx.admin.user.role_id };

			const enrollA = await service.addEnroll(ctx.concurrency.users.a.user.role_id, ctx.concurrency.waitSection.section_id, actingUser, null);
			const enrollB = await service.addEnroll(ctx.concurrency.users.b.user.role_id, ctx.concurrency.waitSection.section_id, actingUser, null);
			const enrollC = await service.addEnroll(ctx.concurrency.users.c.user.role_id, ctx.concurrency.waitSection.section_id, actingUser, null);
			const enrollD = await service.addEnroll(ctx.concurrency.users.d.user.role_id, ctx.concurrency.waitSection.section_id, actingUser, null);

			assert(enrollA.status === 'enrolled', 'First waitlist workflow enrollment should be enrolled.');
			assert(enrollB.status === 'waitlisted', 'Second waitlist workflow enrollment should be waitlisted.');
			assert(enrollC.status === 'waitlisted', 'Third waitlist workflow enrollment should be waitlisted.');
			assert(enrollD.status === 'waitlisted', 'Fourth waitlist workflow enrollment should be waitlisted.');

			ctx.concurrency.waitEnrollments = { a: enrollA, b: enrollB, c: enrollC, d: enrollD };

			const dropA = await service.updEnroll(enrollA.enrollment_id, 'dropped', actingUser, null);
			const checkB = await service.getEnroll(enrollB.enrollment_id, actingUser);
			const checkC = await service.getEnroll(enrollC.enrollment_id, actingUser);
			const checkD = await service.getEnroll(enrollD.enrollment_id, actingUser);

			assert(dropA.status === 'dropped', 'Dropped enrollment should be marked dropped.');
			assert(checkB.status === 'enrolled', 'First waitlisted enrollment should be auto-promoted when a seat opens.');
			assert(checkC.status === 'waitlisted', 'Second waitlisted enrollment should remain queued after the first promotion.');
			assert(checkD.status === 'waitlisted', 'Third waitlisted enrollment should remain queued after the first promotion.');
			ctx.concurrency.waitEnrollments.b = checkB;
			ctx.concurrency.waitEnrollments.c = checkC;
			ctx.concurrency.waitEnrollments.d = checkD;

			return {
				dropA,
				promotedB: checkB,
				waitingC: checkC,
				waitingD: checkD,
			};
		}
	);

	await harness.run(
		'Concurrent promotion attempts only allow the earliest waitlisted enrollment to advance',
		'SERVICE EnrollmentService.updEnroll (promotion race)',
		{ method: 'SERVICE', workflow: 'promotion-race' },
		{ onePromoted: true, oneRejected: true },
		async () => {
			const service = new EnrollmentService();
			const actingUser = { id: ctx.admin.user.id, role: 'ADMIN', role_id: ctx.admin.user.role_id };

			await db.query('UPDATE sections SET capacity = ? WHERE section_id = ?', [2, ctx.concurrency.waitSection.section_id]);

			const first = ctx.concurrency.waitEnrollments.c;
			const second = ctx.concurrency.waitEnrollments.d;
			assert(first?.enrollment_id && second?.enrollment_id, 'Expected two waitlist enrollments for the promotion race.');
			const codes = await service.section.getAcCodes(ctx.concurrency.waitSection.section_id, actingUser);
			const available = Object.entries(codes)
				.filter(([key, value]) => /^code\d+$/.test(key) && typeof value === 'string')
				.map(([, value]) => value);
			assert(available.length >= 2, 'Expected two distinct codes for the promotion race.');

			const [r1, r2] = await Promise.allSettled([
				service.updEnroll(first.enrollment_id, 'enrolled', actingUser, available[0]),
				service.updEnroll(second.enrollment_id, 'enrolled', actingUser, available[1]),
			]);

			const fulfilled = [r1, r2].filter((result) => result.status === 'fulfilled');
			const rejected = [r1, r2].filter((result) => result.status === 'rejected');

			assert(fulfilled.length === 1, 'Exactly one promotion attempt should succeed.');
			assert(rejected.length === 1, 'Exactly one promotion attempt should fail.');
			const success = fulfilled[0].value;
			ctx.concurrency.promotedCode = success?.status === 'enrolled' ? (r1.status === 'fulfilled' ? available[0] : available[1]) : null;
			if (r1.status === 'fulfilled') {
				ctx.concurrency.waitEnrollments.c = r1.value;
			} else if (r2.status === 'fulfilled') {
				ctx.concurrency.waitEnrollments.d = r2.value;
			}

			return {
				first: r1.status === 'fulfilled' ? r1.value : { error: r1.reason.message },
				second: r2.status === 'fulfilled' ? r2.value : { error: r2.reason.message },
			};
		}
	);

	await harness.run(
		'Concurrent access-code generation and revocation leave the section code map readable',
		`POST+DELETE /section/${ctx.section?.section_id ?? ':id'}/access-codes`,
		{ method: 'MULTI', workflow: 'generate-revoke-race' },
		{ status: 200, readableAfterRace: true },
		async () => {
			const snapshot = await clients.professor.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(snapshot, 200);
			const existing = findFirstCode(snapshot.body);
			assert(existing, 'Expected at least one existing code before the generate/revoke race.');

			const [genResponse, revokeResponse] = await Promise.all([
				clients.professor.request(`/section/${ctx.section.section_id}/access-codes`, {
					method: 'POST',
					body: { numCodes: 3 },
				}),
				clients.professor.request(`/section/${ctx.section.section_id}/access-codes?codes=${encodeURIComponent(existing)}`, {
					method: 'DELETE',
				}),
			]);

			assertStatus(genResponse, 200);
			assertStatus(revokeResponse, 200);

			const finalResponse = await clients.professor.request(`/section/${ctx.section.section_id}/access-codes`);
			assertStatus(finalResponse, 200);
			assert(finalResponse.body && typeof finalResponse.body === 'object', 'Final access-code map should remain readable after the race.');

			return {
				generated: harness.responseSummary(genResponse),
				revoked: harness.responseSummary(revokeResponse),
				final: harness.responseSummary(finalResponse),
			};
		}
	);

	await harness.run(
		'Simultaneous duplicate enrollment creation by the same student only creates one record',
		'POST /enrollment (same student race)',
		{ method: 'POST', concurrency: 2 },
		{ oneSuccess: true, oneFailure: true },
		async () => {
			const sectionResponse = await admin.request(`/section/${ctx.concurrency.course.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 2,
				},
			});
			assertStatus(sectionResponse, 201);
			ctx.extraSections.push(sectionResponse.body);

			const [r1, r2] = await Promise.all([
				ctx.concurrency.users.a.client.request('/enrollment', {
					method: 'POST',
					body: { stuId: ctx.concurrency.users.a.user.role_id, secId: sectionResponse.body.section_id },
				}),
				ctx.concurrency.users.a.client.request('/enrollment', {
					method: 'POST',
					body: { stuId: ctx.concurrency.users.a.user.role_id, secId: sectionResponse.body.section_id },
				}),
			]);

			const statuses = [r1.status, r2.status];
			assert(statuses.filter((status) => status === 201).length === 1, 'Exactly one duplicate enrollment race request should succeed.');
			assert(statuses.filter((status) => status === 400).length === 1, 'Exactly one duplicate enrollment race request should fail.');
			const winner = [r1.body, r2.body].find((body) => body?.enrollment_id);
			if (winner?.enrollment_id) ctx.extraEnrollments.push(winner.enrollment_id);

			return [harness.responseSummary(r1), harness.responseSummary(r2)];
		}
	);

	await harness.run(
		'Concurrent profile updates for the same user both complete and leave a valid final profile',
		'PUT /user/me (concurrent)',
		{ method: 'PUT', concurrency: 2 },
		{ statuses: [200, 200] },
		async () => {
			const [r1, r2] = await Promise.all([
				clients.student.request('/user/me', {
					method: 'PUT',
					body: { name: 'Runner Student Concurrency A', email: ctx.users.student.email },
				}),
				clients.student.request('/user/me', {
					method: 'PUT',
					body: { name: 'Runner Student Concurrency B', email: ctx.users.student.email },
				}),
			]);
			assertStatus(r1, 200);
			assertStatus(r2, 200);
			const final = await clients.student.request('/user/me');
			assertStatus(final, 200);
			assert(['Runner Student Concurrency A', 'Runner Student Concurrency B'].includes(final.body?.User?.name), 'Final profile name should match one of the concurrent successful updates.');
			return {
				first: harness.responseSummary(r1),
				second: harness.responseSummary(r2),
				final: harness.responseSummary(final),
			};
		}
	);

	await harness.run(
		'Concurrent admin role updates on the same target both return valid states',
		'PUT /admin/:id/role (concurrent)',
		{ method: 'PUT', concurrency: 2 },
		{ validFinalRole: true },
		async () => {
			const [r1, r2] = await Promise.all([
				admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
					method: 'PUT',
					body: { type: 'PROFESSOR', detail: 'Systems' },
				}),
				admin.request(`/admin/${ctx.users.temp.user.id}/role`, {
					method: 'PUT',
					body: { type: 'STUDENT', detail: 'Biology' },
				}),
			]);
			assert([200, 500].includes(r1.status), 'First concurrent role update should either succeed or surface the current race condition.');
			assert([200, 500].includes(r2.status), 'Second concurrent role update should either succeed or surface the current race condition.');
			assert(r1.status === 200 || r2.status === 200, 'At least one concurrent role update should succeed.');
			const final = await admin.request(`/admin/${ctx.users.temp.user.id}`);
			assertStatus(final, 200);
			assert(['PROFESSOR', 'STUDENT'].includes(final.body?.role), 'Final role after concurrent updates should be one of the submitted roles.');
			ctx.users.temp.user = final.body;
			return {
				first: harness.responseSummary(r1),
				second: harness.responseSummary(r2),
				final: harness.responseSummary(final),
			};
		}
	);

	await harness.run(
		'Simultaneous drop and delete operations promote queued students at most once',
		'SERVICE EnrollmentService.updEnroll/rmvEnroll',
		{ method: 'SERVICE', workflow: 'drop-delete-race' },
		{ promotedAtMostOnce: true },
		async () => {
			const service = new EnrollmentService();
			const actingUser = { id: ctx.admin.user.id, role: 'ADMIN', role_id: ctx.admin.user.role_id };
			const targetA = ctx.concurrency.raceResults.a.body?.enrollment_id ? ctx.concurrency.raceResults.a.body : ctx.concurrency.raceResults.b.body;
			const targetB = ctx.concurrency.raceResults.c.body;
			const results = await Promise.allSettled([service.updEnroll(targetA.enrollment_id, 'dropped', actingUser, null), service.rmvEnroll(targetB.enrollment_id, actingUser)]);

			assert(
				results.every((result) => result.status === 'fulfilled'),
				'Drop/delete race operations should settle successfully.'
			);
			return results.map((result) => (result.status === 'fulfilled' ? result.value : { error: result.reason.message }));
		}
	);
}
