import { assertEqual, assertStatus, assertTruthy } from '../assert.js';
import { authHeaders } from '../http.js';
import { logPass } from '../logger.js';

export async function runCoursesSuite(ctx, request) {
	const sectionRefs = await getSectionRefs(request);

	const invalidListQuery = await request('/api/courses?page=-1&limit=0');
	assertStatus(invalidListQuery, 400, 'GET /api/courses should reject invalid pagination values');
	logPass('GET /api/courses rejects invalid pagination values');

	const invalidSubjectQuery = await request('/api/courses?subject=ZZZZ');
	assertStatus(invalidSubjectQuery, 400, 'GET /api/courses should reject invalid subject filters');
	logPass('GET /api/courses rejects invalid subject filters');

	const publicList = await request('/api/courses?page=1&limit=5');
	assertStatus(publicList, 200, 'GET /api/courses should return a public course list');
	assertTruthy(
		Array.isArray(publicList.body?.courses),
		'GET /api/courses should return a courses array',
		publicList.body
	);
	assertEqual(publicList.body?.meta?.page, 1, 'GET /api/courses should return requested page', publicList.body);
	assertEqual(publicList.body?.meta?.limit, 5, 'GET /api/courses should return requested limit', publicList.body);
	assertTruthy(
		typeof publicList.body?.meta?.total === 'number',
		'GET /api/courses should return total count metadata',
		publicList.body
	);
	logPass('GET /api/courses returns paginated public results');

	const subjectFilteredList = await request('/api/courses?subject=CMSC&limit=5');
	assertStatus(subjectFilteredList, 200, 'GET /api/courses should support subject filtering');
	assertTruthy(
		subjectFilteredList.body?.courses?.length > 0,
		'GET /api/courses subject filter should return courses',
		subjectFilteredList.body
	);
	assertTruthy(
		subjectFilteredList.body.courses.every((course) => course.course_code.startsWith('CMSC')),
		'GET /api/courses subject filter should only return matching subject codes',
		subjectFilteredList.body
	);
	logPass('GET /api/courses supports subject filtering');

	const createAccessCases = [
		{
			options: {
				method: 'POST',
				body: JSON.stringify(ctx.courseTest.create),
			},
			expectedStatus: 401,
			failureMessage: 'POST /api/courses should reject missing token',
			successMessage: 'POST /api/courses rejects missing token',
		},
		{
			options: {
				method: 'POST',
				headers: authHeaders('not-a-real-token'),
				body: JSON.stringify(ctx.courseTest.create),
			},
			expectedStatus: 401,
			failureMessage: 'POST /api/courses should reject invalid token',
			successMessage: 'POST /api/courses rejects invalid token',
		},
		{
			options: {
				method: 'POST',
				headers: authHeaders(ctx.updatedNonAdminAuth.token),
				body: JSON.stringify(ctx.courseTest.create),
			},
			expectedStatus: 403,
			failureMessage: 'POST /api/courses should reject non-admin user',
			successMessage: 'POST /api/courses rejects non-admin user',
		},
	];

	for (const testCase of createAccessCases) {
		const res = await request('/api/courses', testCase.options);
		assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
		logPass(testCase.successMessage);
	}

	const createWithAdminToken = await request('/api/courses', {
		method: 'POST',
		headers: authHeaders(ctx.adminAuth.token),
		body: JSON.stringify(ctx.courseTest.create),
	});
	assertStatus(createWithAdminToken, 201, 'POST /api/courses should allow admin user');

	ctx.createdCourseId = createWithAdminToken.body?.course?.course_id;
	assertTruthy(ctx.createdCourseId, 'Missing created course id', createWithAdminToken.body);
	assertEqual(
		createWithAdminToken.body?.course?.course_code,
		ctx.courseTest.create.code,
		'Unexpected created course code',
		createWithAdminToken.body
	);
	logPass('POST /api/courses allows admin user to create course');

	const duplicateCreate = await request('/api/courses', {
		method: 'POST',
		headers: authHeaders(ctx.adminAuth.token),
		body: JSON.stringify(ctx.courseTest.create),
	});
	assertStatus(duplicateCreate, 409, 'POST /api/courses should reject duplicate course codes');
	logPass('POST /api/courses rejects duplicate course codes');

	const getById = await request(`/api/courses/${ctx.createdCourseId}`);
	assertStatus(getById, 200, 'GET /api/courses/:courseId should return created course');
	assertEqual(
		getById.body?.course_id,
		ctx.createdCourseId,
		'Unexpected course_id from GET /api/courses/:courseId',
		getById.body
	);
	assertEqual(
		getById.body?.course_code,
		ctx.courseTest.create.code,
		'Unexpected course_code from GET /api/courses/:courseId',
		getById.body
	);
	logPass('GET /api/courses/:courseId returns created course');

	const searchedCourseList = await request(
		`/api/courses?search=${encodeURIComponent(ctx.courseTest.create.title)}&limit=10`
	);
	assertStatus(searchedCourseList, 200, 'GET /api/courses should support search');
	assertTruthy(
		searchedCourseList.body?.courses?.some((course) => course.course_id === ctx.createdCourseId),
		'GET /api/courses search should return the created course',
		searchedCourseList.body
	);
	logPass('GET /api/courses supports searching by course fields');

	const updateAccessCases = [
		{
			options: {
				method: 'PUT',
				body: JSON.stringify(ctx.courseTest.update),
			},
			expectedStatus: 401,
			failureMessage: 'PUT /api/courses/:courseId should reject missing token',
			successMessage: 'PUT /api/courses/:courseId rejects missing token',
		},
		{
			options: {
				method: 'PUT',
				headers: authHeaders('not-a-real-token'),
				body: JSON.stringify(ctx.courseTest.update),
			},
			expectedStatus: 401,
			failureMessage: 'PUT /api/courses/:courseId should reject invalid token',
			successMessage: 'PUT /api/courses/:courseId rejects invalid token',
		},
		{
			options: {
				method: 'PUT',
				headers: authHeaders(ctx.updatedNonAdminAuth.token),
				body: JSON.stringify(ctx.courseTest.update),
			},
			expectedStatus: 403,
			failureMessage: 'PUT /api/courses/:courseId should reject non-admin user',
			successMessage: 'PUT /api/courses/:courseId rejects non-admin user',
		},
	];

	for (const testCase of updateAccessCases) {
		const res = await request(`/api/courses/${ctx.createdCourseId}`, testCase.options);
		assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
		logPass(testCase.successMessage);
	}

	const updateWithAdminToken = await request(`/api/courses/${ctx.createdCourseId}`, {
		method: 'PUT',
		headers: authHeaders(ctx.adminAuth.token),
		body: JSON.stringify(ctx.courseTest.update),
	});
	assertStatus(updateWithAdminToken, 200, 'PUT /api/courses/:courseId should allow admin user');
	assertTruthy(
		updateWithAdminToken.body?.course?.course_id,
		'Missing updated course payload',
		updateWithAdminToken.body
	);
	assertEqual(
		updateWithAdminToken.body?.course?.course_code,
		ctx.courseTest.update.code,
		'Course code was not updated',
		updateWithAdminToken.body
	);
	assertEqual(
		updateWithAdminToken.body?.course?.title,
		ctx.courseTest.update.title,
		'Course title was not updated',
		updateWithAdminToken.body
	);
	logPass('PUT /api/courses/:courseId allows admin user to update course');

	const getByIdAfterUpdate = await request(`/api/courses/${ctx.createdCourseId}`);
	assertStatus(getByIdAfterUpdate, 200, 'GET /api/courses/:courseId should return updated course');
	assertEqual(
		getByIdAfterUpdate.body?.course_code,
		ctx.courseTest.update.code,
		'Updated course code not reflected in GET',
		getByIdAfterUpdate.body
	);
	assertEqual(
		getByIdAfterUpdate.body?.title,
		ctx.courseTest.update.title,
		'Updated course title not reflected in GET',
		getByIdAfterUpdate.body
	);
	assertEqual(
		Number(getByIdAfterUpdate.body?.credits),
		ctx.courseTest.update.cred,
		'Updated course credits not reflected in GET',
		getByIdAfterUpdate.body
	);
	logPass('GET /api/courses/:courseId reflects updated course data');

	const searchAfterUpdate = await request(
		`/api/courses?search=${encodeURIComponent(ctx.courseTest.update.code)}&limit=10`
	);
	assertStatus(searchAfterUpdate, 200, 'GET /api/courses should return updated course in search results');
	assertTruthy(
		searchAfterUpdate.body?.courses?.some((course) => course.course_id === ctx.createdCourseId),
		'GET /api/courses search should reflect updated course code',
		searchAfterUpdate.body
	);
	logPass('GET /api/courses search reflects updated course data');

	const deleteAccessCases = [
		{
			options: {
				method: 'DELETE',
			},
			expectedStatus: 401,
			failureMessage: 'DELETE /api/courses/:courseId should reject missing token',
			successMessage: 'DELETE /api/courses/:courseId rejects missing token',
		},
		{
			options: {
				method: 'DELETE',
				headers: authHeaders('not-a-real-token'),
			},
			expectedStatus: 401,
			failureMessage: 'DELETE /api/courses/:courseId should reject invalid token',
			successMessage: 'DELETE /api/courses/:courseId rejects invalid token',
		},
		{
			options: {
				method: 'DELETE',
				headers: authHeaders(ctx.updatedNonAdminAuth.token),
			},
			expectedStatus: 403,
			failureMessage: 'DELETE /api/courses/:courseId should reject non-admin user',
			successMessage: 'DELETE /api/courses/:courseId rejects non-admin user',
		},
	];

	for (const testCase of deleteAccessCases) {
		const res = await request(`/api/courses/${ctx.createdCourseId}`, testCase.options);
		assertStatus(res, testCase.expectedStatus, testCase.failureMessage);
		logPass(testCase.successMessage);
	}

	const guardedCoursePayload = {
		code: `APGD${String(Date.now()).slice(-3)}`,
		title: `Guarded API Test Course ${Date.now()}`,
		desc: 'Created by apiTestRunner to validate delete protection.',
		cred: 3,
	};

	const createGuardedCourse = await request('/api/courses', {
		method: 'POST',
		headers: authHeaders(ctx.adminAuth.token),
		body: JSON.stringify(guardedCoursePayload),
	});
	assertStatus(createGuardedCourse, 201, 'POST /api/courses should create guarded course');
	const guardedCourseId = createGuardedCourse.body?.course?.course_id;
	assertTruthy(guardedCourseId, 'Guarded course id should be present', createGuardedCourse.body);

	const sectionId = await createDependentSection(request, ctx.adminAuth.token, guardedCourseId, sectionRefs);

	const deleteGuardedCourse = await request(`/api/courses/${guardedCourseId}`, {
		method: 'DELETE',
		headers: authHeaders(ctx.adminAuth.token),
	});
	assertStatus(deleteGuardedCourse, 400, 'DELETE /api/courses/:courseId should reject deletion when sections exist');
	logPass('DELETE /api/courses/:courseId rejects deletion when sections exist');

	const deleteDependentSection = await request(`/api/sections/${sectionId}`, {
		method: 'DELETE',
		headers: authHeaders(ctx.adminAuth.token),
	});
	assertStatus(
		deleteDependentSection,
		200,
		'DELETE /api/sections/:sectionId should remove dependent section during course cleanup'
	);

	const deleteGuardedCourseAfterCleanup = await request(`/api/courses/${guardedCourseId}`, {
		method: 'DELETE',
		headers: authHeaders(ctx.adminAuth.token),
	});
	assertStatus(
		deleteGuardedCourseAfterCleanup,
		200,
		'DELETE /api/courses/:courseId should succeed after dependent sections are removed'
	);
	logPass('DELETE /api/courses/:courseId succeeds after dependent sections are removed');

	const deleteWithAdminToken = await request(`/api/courses/${ctx.createdCourseId}`, {
		method: 'DELETE',
		headers: authHeaders(ctx.adminAuth.token),
	});
	assertStatus(deleteWithAdminToken, 200, 'DELETE /api/courses/:courseId should allow admin user');
	logPass('DELETE /api/courses/:courseId allows admin user to delete course');

	const getAfterDelete = await request(`/api/courses/${ctx.createdCourseId}`);
	assertStatus(getAfterDelete, 404, 'GET /api/courses/:courseId should return 404 after deletion');
	logPass('GET /api/courses/:courseId returns 404 after deletion');
}

async function createDependentSection(request, adminToken, courseId, refs) {
	const res = await request(`/api/courses/${courseId}/sections`, {
		method: 'POST',
		headers: authHeaders(adminToken),
		body: JSON.stringify({
			semesterId: refs.semesterId,
			professorId: refs.professorId,
			capacity: 25,
			days: 'MW',
			startTime: '09:00',
			endTime: '10:15',
		}),
	});

	assertStatus(
		res,
		201,
		'POST /api/courses/:courseId/sections should create a dependent section for course delete protection'
	);
	assertTruthy(res.body?.section?.section_id, 'Dependent section id should be present', res.body);

	return res.body.section.section_id;
}

async function getSectionRefs(request) {
	const res = await request('/api/sections?page=1&limit=100');

	assertStatus(res, 200, 'GET /api/sections should provide seed section data for course tests');
	const sections = Array.isArray(res.body?.sections) ? res.body.sections : [];
	const sectionWithProfessor = sections.find((section) => section.professor_id);
	const semesterIds = [...new Set(sections.map((section) => section.semester_id).filter(Boolean))];

	assertTruthy(
		sectionWithProfessor?.professor_id,
		'Course tests require at least one existing section with a professor id',
		res.body
	);
	assertTruthy(semesterIds[0], 'Course tests require at least one existing semester id from section data', res.body);

	return {
		semesterId: semesterIds[0],
		professorId: sectionWithProfessor.professor_id,
	};
}
