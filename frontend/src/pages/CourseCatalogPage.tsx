/*
Adi Avraham
CMSC495 Group Golf Capstone Project
CourseCatalogPage.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders the student course catalog, enrollment cart, filters, and registration actions.
*/

import { useEffect, useMemo, useState } from 'react';
import { createEnrollment, listPrerequisites, listSectionsBySemester, updateEnrollment } from '../api/catalog';
import { ApiError } from '../api/client';
import { StudentOnly } from '../components/AppShell';
import { PaginationControls } from '../components/PaginationControls';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../lib/useFormFeedback';
import { buildEnrichedEnrollments, formatSchedule, loadStudentEnrollmentData, getCurrentSemester, sortSemesters, isValidDayCombination, formatDayCombination } from '../lib/studentEnrollment';
import type { EnrichedEnrollment } from '../lib/studentEnrollment';
import type { Meta, Prerequisite, Section, Semester } from '../types/api';
import { FormField } from '../components/FormField';

type CatalogSection = {
	section: Section,
};

type EnrollmentResult = {
	sectionId: number,
	courseCode: string,
	status: 'success' | 'error',
	message: string,
};

type FlashMessage = {
	id: number,
	kind: 'success' | 'error' | 'info',
	message: string,
};

const SUBJECT_OPTIONS = [
	{ value: '', label: 'All Subjects' },
	{ value: 'CHEM', label: 'Chemistry' },
	{ value: 'CMSC', label: 'Computer Science' },
	{ value: 'ENGL', label: 'English' },
	{ value: 'HIST', label: 'History' },
	{ value: 'IFSM', label: 'Information Systems Management' },
	{ value: 'MATH', label: 'Mathematics' },
	{ value: 'NURS', label: 'Nursing' },
	{ value: 'PHYS', label: 'Physics' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Builds the persistent meeting-day dropdown options from the semester's section list.
function generateDaysOptions(sections: Section[]) {
	const options: Array<{ value: string, label: string }> = [{ value: '', label: 'All Meeting Days' }];

	const uniqueDays = new Set<string>();
	for (const section of sections) {
		if (isValidDayCombination(section.days)) {
			uniqueDays.add(section.days);
		}
	}

	const sortedDays = Array.from(uniqueDays).sort();
	for (const days of sortedDays) {
		options.push({
			value: days,
			label: formatDayCombination(days),
		});
	}

	return options;
}

const EMPTY_META: Meta = {
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
};

// Normalizes a section day code string into a comparable set of meeting days.
function normalizeDays(days: string) {
	if (!days || days === 'async') {
		return new Set<string>();
	}

	return new Set(days.toUpperCase().split(''));
}

// Returns whether two time ranges overlap when both ranges have explicit times.
function timesOverlap(startA: string | null, endA: string | null, startB: string | null, endB: string | null) {
	if (!startA || !endA || !startB || !endB) {
		return false;
	}

	return startA < endB && startB < endA;
}

// Returns whether two sections conflict by semester, shared meeting days, and overlapping times.
function sectionsConflict(left: Section, right: Section) {
	if (left.semester.semester_id !== right.semester.semester_id) {
		return false;
	}

	const leftDays = normalizeDays(left.days);
	const rightDays = normalizeDays(right.days);

	if (leftDays.size === 0 || rightDays.size === 0) {
		return false;
	}

	const sharesDay = [...leftDays].some((day) => rightDays.has(day));

	return sharesDay && timesOverlap(left.start_time, left.end_time, right.start_time, right.end_time);
}

// Finds the first conflicting section for a candidate section within a given section list.
function findConflict(candidate: Section, sections: Section[]) {
	return sections.find((section) => section.section_id !== candidate.section_id && sectionsConflict(candidate, section)) ?? null;
}

export function CourseCatalogPage() {
	const { user, requiresPasswordChange } = useAuth();
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
	const [sections, setSections] = useState<Section[]>([]);
	const [filterSections, setFilterSections] = useState<Section[]>([]);
	const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
	const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
	const [cartSectionIds, setCartSectionIds] = useState<number[]>([]);
	const [cartSections, setCartSections] = useState<Section[]>([]);
	const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
	const [isSubmittingCart, setIsSubmittingCart] = useState(false);
	const [droppingEnrollmentId, setDroppingEnrollmentId] = useState<number | null>(null);
	const [catalogError, setCatalogError] = useState('');
	const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
	const [waitlistAccessCodes, setWaitlistAccessCodes] = useState<Record<number, string>>({});
	const [activatingEnrollmentId, setActivatingEnrollmentId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [subjectFilter, setSubjectFilter] = useState('');
	const [daysFilter, setDaysFilter] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [catalogMeta, setCatalogMeta] = useState<Meta>(EMPTY_META);
	const [prerequisiteMap, setPrerequisiteMap] = useState<Record<number, Prerequisite[]>>({});
	const [completedCourseIds, setCompletedCourseIds] = useState<number[]>([]);

	useEffect(() => {
		void loadCatalogData();
	}, []);

	useEffect(() => {
		if (selectedSemesterId === null) {
			return;
		}

		void loadSections(selectedSemesterId, searchTerm, currentPage, pageSize, subjectFilter, daysFilter);
	}, [currentPage, daysFilter, pageSize, searchTerm, selectedSemesterId, subjectFilter]);

	useEffect(() => {
		if (selectedSemesterId === null) {
			setFilterSections([]);
			return;
		}

		void loadFilterSections(selectedSemesterId);
	}, [selectedSemesterId]);

	useEffect(() => {
		void loadVisiblePrerequisites();
	}, [sections]);

	const uniqueSemesters = useMemo(() => sortSemesters(semesters), [semesters]);

	const catalogSections = useMemo<CatalogSection[]>(
		() =>
			sections.map((section) => ({
				section,
			})),
		[sections]
	);

	const daysOptions = useMemo(() => generateDaysOptions(filterSections), [filterSections]);

	const cartItems = useMemo(() => cartSections.filter((section) => cartSectionIds.includes(section.section_id)).map((section) => ({ section })), [cartSectionIds, cartSections]);

	const currentEnrollments = useMemo<EnrichedEnrollment[]>(() => enrollments, [enrollments]);

	// Adds a transient banner message to the catalog sidebar for action feedback.
	function pushFlashMessage(kind: FlashMessage['kind'], message: string) {
		const id = Date.now() + Math.random();

		setFlashMessages((current) => [...current, { id, kind, message }]);

		window.setTimeout(() => {
			setFlashMessages((current) => current.filter((entry) => entry.id !== id));
		}, 4500);
	}

	// Loads the student's catalog context, current semester, and completed-course prerequisites state.
	async function loadCatalogData() {
		setIsLoadingCatalog(true);
		setCatalogError('');

		try {
			if (!user?.role_id) {
				return;
			}

			const loadedData = await loadStudentEnrollmentData(user.role_id);
			const nextSemesters = loadedData.semesters;
			const loadedEnrollments = buildEnrichedEnrollments(loadedData);
			const completedSections = buildEnrichedEnrollments(loadedData, undefined, ['completed']);

			setSemesters(nextSemesters);
			setEnrollments(loadedEnrollments);
			setCompletedCourseIds([...new Set(completedSections.map((entry) => entry.section.course.course_id))]);

			if (nextSemesters.length > 0) {
				const latestSemester = getCurrentSemester(nextSemesters);
				setCurrentSemesterId(latestSemester?.semester_id ?? null);
				setSelectedSemesterId((current) => current ?? latestSemester?.semester_id ?? null);
			}
		} catch (error) {
			setCatalogError(getErrorMessage(error, 'Unable to load catalog data right now.'));
		} finally {
			setIsLoadingCatalog(false);
		}
	}

	// Refreshes the student's enrollments after a catalog-side enrollment action completes.
	async function refreshEnrollments() {
		if (!user?.role_id) {
			return;
		}

		try {
			const loadedData = await loadStudentEnrollmentData(user.role_id);

			setSemesters(loadedData.semesters);
			setEnrollments(buildEnrichedEnrollments(loadedData));
			setCompletedCourseIds([...new Set(buildEnrichedEnrollments(loadedData, undefined, ['completed']).map((entry) => entry.section.course.course_id))]);
		} catch (error) {
			setCatalogError(getErrorMessage(error, 'Unable to refresh current enrollments.'));
		}
	}

	// Loads the visible paged section list for the selected semester and active filters.
	async function loadSections(semesterId: number, search = '', page = 1, limit = 10, subject = '', days = '') {
		setCatalogError('');

		try {
			const response = await listSectionsBySemester({
				page,
				limit,
				search,
				semId: semesterId,
				subject,
				days,
			});

			const nextSections = response.Section.map((entry) => entry.Section);
			setSections(nextSections);
			setCatalogMeta(response.Meta);
			setCartSections((current) => {
				const nextById = new Map(nextSections.map((section) => [section.section_id, section]));
				return current.map((section) => nextById.get(section.section_id) ?? section);
			});
		} catch (error) {
			setCatalogError(getErrorMessage(error, 'Unable to load sections for that semester.'));
		}
	}

	// Loads a stable semester-scoped section list used to keep filter options persistent.
	async function loadFilterSections(semesterId: number) {
		try {
			const response = await listSectionsBySemester({
				page: 1,
				limit: 100,
				semId: semesterId,
			});

			setFilterSections(response.Section.map((entry) => entry.Section));
		} catch {
			setFilterSections([]);
		}
	}

	// Loads prerequisite lists for the currently visible courses and caches them by course id.
	async function loadVisiblePrerequisites() {
		const missingCourseIds = [...new Set(sections.map((section) => section.course.course_id))].filter((courseId) => prerequisiteMap[courseId] === undefined);

		if (missingCourseIds.length === 0) {
			return;
		}

		try {
			const responses = await Promise.all(
				missingCourseIds.map(async (courseId) => ({
					courseId,
					prerequisites: await listPrerequisites(courseId),
				}))
			);

			setPrerequisiteMap((current) => {
				const next = { ...current };
				for (const response of responses) {
					next[response.courseId] = response.prerequisites.map((entry) => entry.Prerequisite);
				}
				return next;
			});
		} catch {
			setPrerequisiteMap((current) => {
				const next = { ...current };
				for (const courseId of missingCourseIds) {
					next[courseId] = [];
				}
				return next;
			});
		}
	}

	// Adds a section to the enrollment cart after checking for schedule conflicts.
	function addToCart(sectionId: number) {
		const section = sections.find((entry) => entry.section_id === sectionId);

		if (!section) {
			return;
		}

		const existingConflict = findConflict(section, [...cartSections, ...currentEnrollments.map((entry) => entry.section)]);

		if (existingConflict) {
			pushFlashMessage('error', `Cannot add ${section.course.course_code}. It conflicts with ${existingConflict.course.course_code} on ${formatSchedule(existingConflict)}.`);
			return;
		}

		setCartSectionIds((current) => (current.includes(sectionId) ? current : [...current, sectionId]));
		setCartSections((current) => (current.some((entry) => entry.section_id === sectionId) ? current : [...current, section]));
	}

	// Removes a section from the enrollment cart.
	function removeFromCart(sectionId: number) {
		setCartSectionIds((current) => current.filter((id) => id !== sectionId));
		setCartSections((current) => current.filter((section) => section.section_id !== sectionId));
	}

	function handleSubjectFilterChange(value: string) {
		setSubjectFilter(value);
		setCurrentPage(1);
	}

	function handleDaysFilterChange(value: string) {
		setDaysFilter(value);
		setCurrentPage(1);
	}

	function handleSearchChange(value: string) {
		setSearchTerm(value);
		setCurrentPage(1);
	}

	function handleSemesterChange(value: number) {
		setSelectedSemesterId(value);
		setCurrentPage(1);
	}

	function handlePageSizeChange(value: number) {
		setPageSize(value);
		setCurrentPage(1);
	}

	// Drops an enrolled or waitlisted course from the student's current enrollments.
	async function handleDropEnrollment(enrollmentId: number) {
		setDroppingEnrollmentId(enrollmentId);
		setCatalogError('');

		try {
			await updateEnrollment(enrollmentId, { status: 'dropped' });
			pushFlashMessage('success', 'Enrollment updated. The selected course was dropped.');
			await refreshEnrollments();
			if (selectedSemesterId !== null) {
				await loadSections(selectedSemesterId, searchTerm, currentPage, pageSize, subjectFilter, daysFilter);
			}
		} catch (error) {
			setCatalogError(getErrorMessage(error, 'Unable to drop that enrollment right now.'));
		} finally {
			setDroppingEnrollmentId(null);
		}
	}

	// Tracks access-code input values for waitlisted enrollment activations.
	function handleAccessCodeChange(enrollmentId: number, value: string) {
		setWaitlistAccessCodes((current) => ({
			...current,
			[enrollmentId]: value,
		}));
	}

	// Uses an access code to promote a waitlisted enrollment into enrolled.
	async function handleActivateWaitlistedEnrollment(enrollmentId: number) {
		const code = waitlistAccessCodes[enrollmentId]?.trim() ?? '';

		if (!code) {
			pushFlashMessage('error', 'Enter an access code before trying to enroll from the waitlist.');
			return;
		}

		setActivatingEnrollmentId(enrollmentId);
		setCatalogError('');

		try {
			await updateEnrollment(enrollmentId, { status: 'enrolled', code });
			setWaitlistAccessCodes((current) => ({
				...current,
				[enrollmentId]: '',
			}));
			pushFlashMessage('success', 'Waitlisted enrollment moved to enrolled.');
			await refreshEnrollments();
			if (selectedSemesterId !== null) {
				await loadSections(selectedSemesterId, searchTerm, currentPage, pageSize, subjectFilter, daysFilter);
			}
		} catch (error) {
			pushFlashMessage('error', getErrorMessage(error, 'Unable to apply that access code right now.'));
		} finally {
			setActivatingEnrollmentId(null);
		}
	}

	// Processes the current enrollment cart and creates registrations one section at a time.
	async function enrollCart() {
		if (!user?.role_id || cartItems.length === 0) {
			return;
		}

		if (selectedSemesterId !== currentSemesterId) {
			pushFlashMessage('error', 'You can only enroll in courses from the current semester.');
			return;
		}

		setIsSubmittingCart(true);

		const results: EnrollmentResult[] = [];
		const plannedSections = [...currentEnrollments.map((entry) => entry.section)];

		for (const item of cartItems) {
			const existingConflict = findConflict(item.section, plannedSections);

			if (existingConflict) {
				results.push({
					sectionId: item.section.section_id,
					courseCode: item.section?.course?.course_code ?? `Course ${item.section.course.course_id}`,
					status: 'error',
					message: `Schedule conflict with ${existingConflict.course.course_code} (${formatSchedule(existingConflict)}).`,
				});
				continue;
			}

			try {
				const enrollment = await createEnrollment({
					secId: item.section.section_id,
					stuId: user.role_id,
				});

				results.push({
					sectionId: item.section.section_id,
					courseCode: item.section?.course?.course_code ?? `Course ${item.section.course.course_id}`,
					status: 'success',
					message: enrollment.status === 'waitlisted' ? 'Added successfully. You were placed on the waitlist.' : 'Added successfully. You are enrolled.',
				});
				plannedSections.push(item.section);
			} catch (error) {
				results.push({
					sectionId: item.section.section_id,
					courseCode: item.section?.course?.course_code ?? `Course ${item.section.course.course_id}`,
					status: 'error',
					message: error instanceof ApiError ? error.message : 'Enrollment failed.',
				});
			}
		}

		const successfulIds = new Set(results.filter((result) => result.status === 'success').map((result) => result.sectionId));

		setCartSectionIds((current) => current.filter((sectionId) => !successfulIds.has(sectionId)));
		setCartSections((current) => current.filter((section) => !successfulIds.has(section.section_id)));
		results.forEach((result) => {
			pushFlashMessage(result.status === 'success' ? 'success' : 'error', `${result.courseCode}: ${result.message}`);
		});

		pushFlashMessage(
			successfulIds.size > 0 ? 'success' : 'info',
			successfulIds.size > 0 ? `Processed ${results.length} section${results.length === 1 ? '' : 's'} and enrolled ${successfulIds.size}.` : 'No sections were enrolled.'
		);

		if (successfulIds.size > 0) {
			await refreshEnrollments();
			if (selectedSemesterId !== null) {
				await loadSections(selectedSemesterId, searchTerm, currentPage, pageSize, subjectFilter, daysFilter);
			}
		}

		setIsSubmittingCart(false);
	}

	return (
		<StudentOnly>
			<section className="panel stack-lg catalog-page-panel">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Student Workflow</p>
						<h2>Course Registration</h2>
					</div>
				</div>
				<div className="catalog-shell">
					<div className="catalog-main">
						<div className="catalog-toolbar">
							<section className="catalog-toolbar-box catalog-toolbar-filters">
								<div className="catalog-filter-grid">
									<label className="field" htmlFor="semester-select">
										<span>Semester</span>
										<select
											id="semester-select"
											value={selectedSemesterId ?? ''}
											onChange={(event) => handleSemesterChange(Number(event.target.value))}
											disabled={isLoadingCatalog || semesters.length === 0}
										>
											{uniqueSemesters.map((semester) => (
												<option key={semester.semester_id} value={semester.semester_id}>
													{semester.term} {semester.year}
												</option>
											))}
										</select>
									</label>
									<label className="field" htmlFor="subject-filter">
										<span>Subject</span>
										<select id="subject-filter" value={subjectFilter} onChange={(event) => handleSubjectFilterChange(event.target.value)}>
											{SUBJECT_OPTIONS.map((option) => (
												<option key={option.value || 'all-subjects'} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</label>
									<label className="field" htmlFor="days-filter">
										<span>Meeting Days</span>
										<select id="days-filter" value={daysFilter} onChange={(event) => handleDaysFilterChange(event.target.value)}>
											{daysOptions.map((option) => (
												<option key={option.value || 'all-days'} value={option.value}>
													{option.label}
												</option>
											))}
										</select>
									</label>
									<label className="field" htmlFor="page-size-select">
										<span>Items Per Page</span>
										<select id="page-size-select" value={pageSize} onChange={(event) => handlePageSizeChange(Number(event.target.value))}>
											{PAGE_SIZE_OPTIONS.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									</label>
								</div>
							</section>
							<section className="catalog-toolbar-box catalog-toolbar-search-box">
								<FormField id="search" label="Search" value={searchTerm} onChange={handleSearchChange} placeholder="Code, title, professor" />
							</section>
						</div>

						{catalogError ? <StatusMessage kind="error" message={catalogError} /> : null}

						<div className="catalog-list-window">
							{isLoadingCatalog ? (
								<p>Loading course catalog...</p>
							) : (
								<>
									<PaginationControls meta={catalogMeta} onPageChange={setCurrentPage} position="top" />

									<div className="catalog-list-scroll">
										<div className="section-list">
											{catalogSections.length > 0 ? (
												catalogSections.map((entry) => {
													const alreadyInCart = cartSectionIds.includes(entry.section.section_id);
													const prerequisites = prerequisiteMap[entry.section.course.course_id] ?? [];
													const waitlistAvailable = entry.section.seats_available === 0 && entry.section.waitlisted_count < 3;

													return (
														<article key={entry.section.section_id} className="section-card">
															<div className="section-header">
																<div>
																	<p className="eyebrow">
																		{entry.section?.course?.subject ?? 'Course'} - {entry.section?.course?.credits ?? '?'} credits
																	</p>
																	<h3>
																		{entry.section?.course?.course_code ?? `Course ${entry.section.course.course_id}`} -{' '}
																		{entry.section?.course?.title ?? 'Untitled course'}
																	</h3>
																</div>
																<span className="pill">Section #{entry.section.section_id}</span>
															</div>

															<p className="section-description">{entry.section?.course?.description ?? 'No course description available.'}</p>

															{prerequisites.length > 0 ? (
																<div className="catalog-prerequisite-row" aria-label="Prerequisites">
																	<span className="catalog-prerequisite-label">Prereqs</span>
																	<div className="catalog-prerequisite-list">
																		{prerequisites.map((prerequisite) => {
																			const isCompleted = completedCourseIds.includes(prerequisite.courseId);
																			return (
																				<span
																					key={`${entry.section.section_id}-${prerequisite.courseId}`}
																					className={`catalog-prerequisite-chip ${isCompleted ? 'complete' : 'incomplete'}`}
																				>
																					{prerequisite.courseCode}
																				</span>
																			);
																		})}
																	</div>
																</div>
															) : null}

															{entry.section.seats_available === 0 ? (
																<div className="catalog-prerequisite-row" aria-label="Waitlist availability">
																	<span className="catalog-prerequisite-label">Waitlist</span>
																	<div className="catalog-prerequisite-list">
																		<span className={`catalog-prerequisite-chip ${waitlistAvailable ? 'complete' : 'incomplete'}`}>
																			{waitlistAvailable ? 'Waitlist Available' : 'Waitlist Full'}
																		</span>
																	</div>
																</div>
															) : null}

															<div className="catalog-meta-grid">
																<div className="info-card">
																	<span className="info-label">Semester</span>
																	<strong>{entry.section.semester ? `${entry.section.semester.term} ${entry.section.semester.year}` : 'Unknown'}</strong>
																</div>
																<div className="info-card">
																	<span className="info-label">Meeting</span>
																	<strong>{formatSchedule(entry.section)}</strong>
																</div>
																<div className="info-card">
																	<span className="info-label">Professor</span>
																	<strong>{entry.section.professor.professor_name}</strong>
																</div>
																<div className="info-card">
																	<span className="info-label">Seats Available</span>
																	<strong>
																		{entry.section.seats_available} / {entry.section.capacity}
																	</strong>
																</div>
															</div>

															<div className="section-actions">
																<button
																	type="button"
																	className={alreadyInCart ? 'secondary-button' : 'primary-button'}
																	onClick={() => (alreadyInCart ? removeFromCart(entry.section.section_id) : addToCart(entry.section.section_id))}
																	disabled={entry.section.semester.semester_id !== currentSemesterId}
																	title={entry.section.semester.semester_id !== currentSemesterId ? 'This course is from a previous semester and is view-only' : ''}
																>
																	{alreadyInCart ? 'Remove From Cart' : 'Add To Cart'}
																</button>
															</div>
														</article>
													);
												})
											) : (
												<p className="sidebar-meta">No sections matched the current filters.</p>
											)}
										</div>
									</div>

									<PaginationControls meta={catalogMeta} onPageChange={setCurrentPage} />
								</>
							)}
						</div>
					</div>

					<aside className="catalog-side stack">
						{flashMessages.length > 0 ? (
							<div className="catalog-flash-stack" aria-live="polite">
								{flashMessages.map((message) => (
									<div key={message.id} className={`catalog-flash-banner catalog-flash-${message.kind}`}>
										<StatusMessage kind={message.kind} message={message.message} />
									</div>
								))}
							</div>
						) : null}

						<section className="subpanel stack">
							<h3>Enrollment Cart</h3>
							<section className="cart-summary">
								<div>
									<p className="cart-count">{cartItems.length}</p>
									<p className="sidebar-meta">Sections selected</p>
								</div>
								<button type="button" className="primary-button" onClick={() => void enrollCart()} disabled={cartItems.length === 0 || isSubmittingCart || requiresPasswordChange}>
									{isSubmittingCart ? 'Checking & Enrolling...' : 'Enroll Selected'}
								</button>
							</section>
							{cartItems.length > 0 ? (
								<div className="catalog-side-scroll">
									<div className="cart-list">
										{cartItems.map((item) => (
											<article key={item.section.section_id} className="cart-item">
												<div>
													<strong>{item.section?.course?.course_code ?? `Course ${item.section.course.course_id}`}</strong>
													<p className="sidebar-meta">
														Section #{item.section.section_id} - {formatSchedule(item.section)}
													</p>
												</div>
												<button type="button" className="secondary-button" onClick={() => removeFromCart(item.section.section_id)}>
													Remove
												</button>
											</article>
										))}
									</div>
								</div>
							) : null}
						</section>

						<section className="subpanel stack">
							<h3>Current Enrollments</h3>
							{currentEnrollments.length > 0 ? (
								<div className="catalog-side-scroll">
									<div className="cart-list">
										{currentEnrollments.map((entry) => (
											<article key={entry.enrollment.enrollment_id} className={`cart-item enrollment-item ${entry.enrollment.status}`}>
												<div>
													<strong>{entry.section?.course?.course_code ?? `Course ${entry.section?.course.course_id ?? 'Unknown'}`}</strong>
													<p className="sidebar-meta">
														{entry.section?.course?.title ?? 'Untitled course'}
														{' - '}
														{entry.section?.semester ? `${entry.section?.semester.term} ${entry.section?.semester.year}` : 'Unknown semester'}
													</p>
													<p className="sidebar-meta">
														Section #{entry.section?.section_id ?? entry.enrollment.section_id}
														{' - '}
														{entry.section ? formatSchedule(entry.section) : 'Schedule unavailable'}
													</p>
													{entry.enrollment.status === 'waitlisted' ? (
														<div className="waitlist-actions">
															<input
																type="text"
																className="waitlist-access-input"
																placeholder="Access code"
																value={waitlistAccessCodes[entry.enrollment.enrollment_id] ?? ''}
																onChange={(event) => handleAccessCodeChange(entry.enrollment.enrollment_id, event.target.value)}
															/>
															<button
																type="button"
																className="pill-button"
																onClick={() => void handleActivateWaitlistedEnrollment(entry.enrollment.enrollment_id)}
																disabled={activatingEnrollmentId === entry.enrollment.enrollment_id}
															>
																{activatingEnrollmentId === entry.enrollment.enrollment_id ? 'Applying...' : 'Use Access Code'}
															</button>
														</div>
													) : null}
												</div>
												<button
													type="button"
													className="pill-button"
													onClick={() => void handleDropEnrollment(entry.enrollment.enrollment_id)}
													disabled={droppingEnrollmentId === entry.enrollment.enrollment_id}
												>
													{droppingEnrollmentId === entry.enrollment.enrollment_id ? 'Dropping...' : `${entry.enrollment.status} - Drop`}
												</button>
											</article>
										))}
									</div>
								</div>
							) : (
								<p className="sidebar-meta">No active enrollments found for this student.</p>
							)}
						</section>
					</aside>
				</div>
			</section>
		</StudentOnly>
	);
}
