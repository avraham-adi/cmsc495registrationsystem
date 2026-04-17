import { assert, assertStatus } from '../shared.js';

export async function runEnrollmentSuite(env) {
	const { harness, clients, ctx } = env;
	const { student, otherStudent, admin } = clients;

	await harness.run(
		'Students cannot create enrollments for other students',
		'POST /enrollment',
		{ method: 'POST', client: 'student', body: { stuId: ctx.users.otherStudent.user?.role_id, secId: ctx.section?.section_id } },
		{ status: 403 },
		async () => {
			const response = await student.request('/enrollment', {
				method: 'POST',
				body: {
					stuId: ctx.users.otherStudent.user.role_id,
					secId: ctx.section.section_id,
				},
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Students can create an enrollment without an access code',
		'POST /enrollment',
		{ method: 'POST', client: 'student', body: { stuId: ctx.users.student.user?.role_id, secId: ctx.section?.section_id } },
		{ status: 201 },
		async () => {
			const response = await student.request('/enrollment', {
				method: 'POST',
				body: {
					stuId: ctx.users.student.user.role_id,
					secId: ctx.section.section_id,
				},
			});
			assertStatus(response, 201);
			ctx.enrollment1 = response.body;
			assert(response.body?.status === 'enrolled', 'Initial enrollment should be enrolled.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Duplicate enrollments are rejected',
		'POST /enrollment',
		{ method: 'POST', client: 'student', body: { stuId: ctx.users.student.user?.role_id, secId: ctx.section?.section_id } },
		{ status: 400 },
		async () => {
			const response = await student.request('/enrollment', {
				method: 'POST',
				body: {
					stuId: ctx.users.student.user.role_id,
					secId: ctx.section.section_id,
				},
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Students can fetch their own enrollment', `GET /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`, { method: 'GET', client: 'student' }, { status: 200 }, async () => {
		const response = await student.request(`/enrollment/${ctx.enrollment1.enrollment_id}`);
		assertStatus(response, 200);
		assert(response.body?.enrollment_id === ctx.enrollment1.enrollment_id, 'Enrollment read returned the wrong enrollment.');
		return harness.responseSummary(response);
	});

	await harness.run(
		'Enrollment creation rejects schedule conflicts',
		'PUT /section + POST /course + POST /section + POST /enrollment',
		{ method: 'MULTI', client: 'student' },
		{ status: 409 },
		async () => {
			const sectionUpdate = await admin.request(`/section/${ctx.section.section_id}`, {
				method: 'PUT',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 1,
					days: 'MW',
					startTm: '09:00:00',
					endTm: '10:15:00',
				},
			});
			assertStatus(sectionUpdate, 200);
			ctx.section = sectionUpdate.body;

			const courseResponse = await admin.request('/course', {
				method: 'POST',
				body: {
					code: 'CMSC998',
					title: 'Conflict Course',
					desc: 'Conflict testing course',
					cred: 3,
				},
			});
			assertStatus(courseResponse, 201);
			ctx.extraCourses.push(courseResponse.body);

			const sectionResponse = await admin.request(`/section/${courseResponse.body.course_id}`, {
				method: 'POST',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 5,
					days: 'MW',
					startTm: '09:30:00',
					endTm: '10:45:00',
				},
			});
			assertStatus(sectionResponse, 201);
			ctx.extraSections.push(sectionResponse.body);

			const response = await student.request('/enrollment', {
				method: 'POST',
				body: {
					stuId: ctx.users.student.user.role_id,
					secId: sectionResponse.body.section_id,
				},
			});
			assertStatus(response, 409);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Students can list their own enrollments',
		`GET /enrollment?stuId=${ctx.users.student.user?.role_id ?? ':id'}`,
		{ method: 'GET', client: 'student', query: { stuId: ctx.users.student.user?.role_id } },
		{ status: 200 },
		async () => {
			const response = await student.request(`/enrollment?stuId=${ctx.users.student.user.role_id}`);
			assertStatus(response, 200);
			assert(Array.isArray(response.body), 'Enrollment list response should be an array.');
			assert(
				response.body.some((entry) => entry?.Enrollment?.enrollment_id === ctx.enrollment1.enrollment_id),
				'Enrollment list should include the student enrollment.'
			);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Second student cannot fetch another student enrollment',
		`GET /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`,
		{ method: 'GET', client: 'otherStudent' },
		{ status: 403 },
		async () => {
			const response = await otherStudent.request(`/enrollment/${ctx.enrollment1.enrollment_id}`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Second student cannot list another student enrollments',
		`GET /enrollment?stuId=${ctx.users.student.user?.role_id ?? ':id'}`,
		{ method: 'GET', client: 'otherStudent', query: { stuId: ctx.users.student.user?.role_id } },
		{ status: 403 },
		async () => {
			const response = await otherStudent.request(`/enrollment?stuId=${ctx.users.student.user.role_id}`);
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Second student is waitlisted when the section is already full',
		'POST /enrollment',
		{ method: 'POST', client: 'otherStudent', body: { stuId: ctx.users.otherStudent.user?.role_id, secId: ctx.section?.section_id } },
		{ status: 201 },
		async () => {
			const response = await otherStudent.request('/enrollment', {
				method: 'POST',
				body: {
					stuId: ctx.users.otherStudent.user.role_id,
					secId: ctx.section.section_id,
				},
			});
			assertStatus(response, 201);
			ctx.enrollment2 = response.body;
			assert(response.body?.status === 'waitlisted', 'Second student should be waitlisted once capacity is full.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Waitlisted students cannot move to enrolled without an access code',
		`PUT /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'otherStudent', body: { status: 'enrolled' } },
		{ status: 400 },
		async () => {
			const response = await otherStudent.request(`/enrollment/${ctx.enrollment2.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'enrolled' },
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Section updates succeed with valid capacities',
		`PUT /section/${ctx.section?.section_id ?? ':id'}`,
		{ method: 'PUT', client: 'admin', body: { semId: ctx.semester?.semester_id, profId: ctx.users.professor.user?.role_id, capacity: 3, days: 'MWF', startTm: '09:00:00', endTm: '10:00:00' } },
		{ status: 200 },
		async () => {
			const response = await admin.request(`/section/${ctx.section.section_id}`, {
				method: 'PUT',
				body: {
					semId: ctx.semester.semester_id,
					profId: ctx.users.professor.user.role_id,
					capacity: 3,
					days: 'MWF',
					startTm: '09:00:00',
					endTm: '10:00:00',
				},
			});
			assertStatus(response, 200);
			ctx.section = response.body;
			assert(response.body?.days === 'MWF', 'Section update should persist days.');
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Students can drop their own enrollments',
		`PUT /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'student', body: { status: 'dropped' } },
		{ status: 200 },
		async () => {
			const response = await student.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'dropped' },
			});
			assertStatus(response, 200);
			assert(response.body?.status === 'dropped', 'Enrollment should be marked dropped.');
			ctx.enrollment1 = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Dropping an enrolled student automatically promotes the next waitlisted student',
		`GET /enrollment/${ctx.enrollment2?.enrollment_id ?? ':id'}`,
		{ method: 'GET', client: 'otherStudent' },
		{ status: 200 },
		async () => {
			const response = await otherStudent.request(`/enrollment/${ctx.enrollment2.enrollment_id}`);
			assertStatus(response, 200);
			assert(response.body?.status === 'enrolled', 'Waitlisted enrollment should be automatically promoted after a drop opens a seat.');
			ctx.enrollment2 = response.body;
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Students cannot perform disallowed post-drop transitions',
		`PUT /enrollment/${ctx.enrollment1?.enrollment_id ?? ':id'}`,
		{ method: 'PUT', client: 'student', body: { status: 'completed' } },
		{ status: 403 },
		async () => {
			const response = await student.request(`/enrollment/${ctx.enrollment1.enrollment_id}`, {
				method: 'PUT',
				body: { status: 'completed' },
			});
			assertStatus(response, 403);
			return harness.responseSummary(response);
		}
	);

	await harness.run(
		'Deleting a semester with scheduled sections is blocked',
		`DELETE /semester/${ctx.semester?.semester_id ?? ':id'}`,
		{ method: 'DELETE', client: 'admin' },
		{ status: 400 },
		async () => {
			const response = await admin.request(`/semester/${ctx.semester.semester_id}`, {
				method: 'DELETE',
			});
			assertStatus(response, 400);
			return harness.responseSummary(response);
		}
	);

	await harness.run('Deleting a section with enrollments is blocked', `DELETE /section/${ctx.section?.section_id ?? ':id'}`, { method: 'DELETE', client: 'admin' }, { status: 400 }, async () => {
		const response = await admin.request(`/section/${ctx.section.section_id}`, {
			method: 'DELETE',
		});
		assertStatus(response, 400);
		return harness.responseSummary(response);
	});
}
