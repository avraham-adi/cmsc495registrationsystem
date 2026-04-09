import { useEffect, useMemo, useState } from 'react';
import { createEnrollment, listSectionsBySemester, updateEnrollment } from '../api/catalog';
import { ApiError } from '../api/client';
import { StudentOnly } from '../components/AppShell';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { buildEnrichedEnrollments, formatSchedule, loadStudentEnrollmentData } from '../lib/studentEnrollment';
import type { EnrichedEnrollment } from '../lib/studentEnrollment';
import type { Section } from '../types/api';
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

export function CourseCatalogPage() {
	const { user } = useAuth();
	const [semesters, setSemesters] = useState<Section[]>([]);
	const [courses, setCourses] = useState<Section[]>([]);
	const [sections, setSections] = useState<Section[]>([]);
	const [enrollments, setEnrollments] = useState<EnrichedEnrollment[]>([]);
	const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
	const [cartSectionIds, setCartSectionIds] = useState<number[]>([]);
	const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
	const [isSubmittingCart, setIsSubmittingCart] = useState(false);
	const [droppingEnrollmentId, setDroppingEnrollmentId] = useState<number | null>(null);
	const [catalogError, setCatalogError] = useState('');
	const [cartMessage, setCartMessage] = useState('');
	const [enrollmentResults, setEnrollmentResults] = useState<EnrollmentResult[]>([]);
	const [searchParams, setSearchParams] = useState('');

	useEffect(() => {
		void loadCatalogData();
	}, []);

	useEffect(() => {
		if (selectedSemesterId === null) {
			return;
		}

		void loadSections(selectedSemesterId, searchParams);
	}, [selectedSemesterId, searchParams]);

	const semesterMap = useMemo(() => new Map(semesters.map((section) => [section.semester.semester_id, section])), [semesters]);

	const courseMap = useMemo(() => new Map(courses.map((section) => [section.course.course_id, section])), [courses]);

	const catalogSections = useMemo<CatalogSection[]>(
		() =>
			sections.map((section) => ({
				section,
			})),
		[courseMap, sections, semesterMap]
	);

	const uniqueSemesters = Array.from(new Map(semesters.map((entry) => [entry.semester.semester_id, entry.semester])).values());

	const cartItems = useMemo(() => catalogSections.filter((entry) => cartSectionIds.includes(entry.section.section_id)), [cartSectionIds, catalogSections]);

	const currentEnrollments = useMemo<EnrichedEnrollment[]>(() => enrollments, [enrollments]);

	async function loadCatalogData() {
		setIsLoadingCatalog(true);
		setCatalogError('');

		try {
			if (!user?.role_id) {
				return;
			}

			const loadedData = await loadStudentEnrollmentData(user.role_id);
			const nextSemesters = loadedData.sections;
			const nextCourses = loadedData.sections;

			setSemesters(nextSemesters);
			setCourses(nextCourses);
			setEnrollments(buildEnrichedEnrollments(loadedData));

			if (nextSemesters.length > 0) {
				setSelectedSemesterId((current) => current ?? nextSemesters[0].semester.semester_id);
			}
		} catch (error) {
			if (error instanceof ApiError) {
				setCatalogError(error.message);
			} else {
				console.error(error);

				setCatalogError('Unable to load catalog data right now.' + error);
			}
		} finally {
			setIsLoadingCatalog(false);
		}
	}

	async function refreshEnrollments() {
		if (!user?.role_id) {
			return;
		}

		try {
			const loadedData = await loadStudentEnrollmentData(user.role_id);
			setSemesters(loadedData.sections);
			setCourses(loadedData.sections);
			setEnrollments(buildEnrichedEnrollments(loadedData));
		} catch (error) {
			if (error instanceof ApiError) {
				setCatalogError(error.message);
			} else {
				setCatalogError('Unable to refresh current enrollments.');
			}
		}
	}

	async function loadSections(semesterId: number, search = '') {
		setCatalogError('');
		setEnrollmentResults([]);
		setCartMessage('');

		try {
			const response = await listSectionsBySemester(semesterId, search);
			setSections(response.Section.map((entry) => entry.Section));
			setCartSectionIds((current) => current.filter((sectionId) => response.Section.some((entry) => entry.Section.section_id === sectionId)));
		} catch (error) {
			if (error instanceof ApiError) {
				setCatalogError(error.message);
			} else {
				setCatalogError('Unable to load sections for that semester.');
			}
		}
	}

	function addToCart(sectionId: number) {
		setCartMessage('');
		setEnrollmentResults([]);
		setCartSectionIds((current) => (current.includes(sectionId) ? current : [...current, sectionId]));
	}

	function removeFromCart(sectionId: number) {
		setCartSectionIds((current) => current.filter((id) => id !== sectionId));
	}

	async function handleDropEnrollment(enrollmentId: number) {
		setDroppingEnrollmentId(enrollmentId);
		setCatalogError('');
		setCartMessage('');

		try {
			await updateEnrollment(enrollmentId, { status: 'dropped' });
			setCartMessage('Enrollment updated. The selected course was dropped.');
			await refreshEnrollments();
		} catch (error) {
			if (error instanceof ApiError) {
				setCatalogError(error.message);
			} else {
				setCatalogError('Unable to drop that enrollment right now.');
			}
		} finally {
			setDroppingEnrollmentId(null);
		}
	}

	async function enrollCart() {
		if (!user?.role_id || cartItems.length === 0) {
			return;
		}

		setIsSubmittingCart(true);
		setCartMessage('');
		setEnrollmentResults([]);

		const results: EnrollmentResult[] = [];

		for (const item of cartItems) {
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

		setEnrollmentResults(results);
		setCartSectionIds([]);
		setCartMessage(
			successfulIds.size > 0
				? `Processed ${results.length} section${results.length === 1 ? '' : 's'} and enrolled ${successfulIds.size}.`
				: 'No sections were enrolled. Review the backend validation messages below.'
		);
		if (successfulIds.size > 0) {
			await refreshEnrollments();
		}
		setIsSubmittingCart(false);
	}

	return (
		<StudentOnly>
			<section className="panel stack-lg">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Student Workflow</p>
						<h2>Course Catalog</h2>
					</div>
				</div>
				<div className="catalog-shell">
					<div className="catalog-main">
						<div className="catalog-toolbar">
							<label className="field" htmlFor="semester-select">
								<span>Semester</span>
								<select
									id="semester-select"
									value={selectedSemesterId ?? ''}
									onChange={(event) => setSelectedSemesterId(Number(event.target.value))}
									disabled={isLoadingCatalog || semesters.length === 0}
								>
									{uniqueSemesters.map((semester) => (
										<option key={semester.semester_id} value={semester.semester_id}>
											{semester.term} {semester.year}
										</option>
									))}
								</select>
							</label>
							<label className="field" htmlFor="subject-select">
								<FormField id="search" label="Search" value={searchParams} onChange={setSearchParams} />
								{semesters.map((section) => (
									<option key={section.semester.semester_id} value={section.semester.semester_id}>
										{section.semester.term} {section.semester.year}
									</option>
								))}
							</label>
							<section className="cart-summary">
								<div>
									<p className="cart-count">{cartItems.length}</p>
									<p className="sidebar-meta">Sections selected</p>
								</div>
								<button type="button" className="primary-button" onClick={() => void enrollCart()} disabled={cartItems.length === 0 || isSubmittingCart}>
									{isSubmittingCart ? 'Checking & Enrolling...' : 'Enroll Selected'}
								</button>
							</section>
						</div>

						{catalogError ? <StatusMessage kind="error" message={catalogError} /> : null}

						<div className="catalog-list-window">
							{isLoadingCatalog ? (
								<p>Loading course catalog...</p>
							) : (
								<div className="section-list">
									{catalogSections.map((entry) => {
										const alreadyInCart = cartSectionIds.includes(entry.section.section_id);

										return (
											<article key={entry.section.section_id} className="section-card">
												<div className="section-header">
													<div>
														<p className="eyebrow">
															{entry.section?.course?.subject ?? 'Course'} - {entry.section?.course?.credits ?? '?'} credits
														</p>
														<h3>
															{entry.section?.course?.course_code ?? `Course ${entry.section.course.course_id}`} - {entry.section?.course?.title ?? 'Untitled course'}
														</h3>
													</div>
													<span className="pill">Section #{entry.section.section_id}</span>
												</div>

												<p className="section-description">{entry.section?.course?.description ?? 'No course description available.'}</p>

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
														<span className="info-label">Capacity</span>
														<strong>{entry.section.capacity}</strong>
													</div>
												</div>

												<div className="section-actions">
													<button
														type="button"
														className={alreadyInCart ? 'secondary-button' : 'primary-button'}
														onClick={() => (alreadyInCart ? removeFromCart(entry.section.section_id) : addToCart(entry.section.section_id))}
													>
														{alreadyInCart ? 'Remove From Cart' : 'Add To Cart'}
													</button>
												</div>
											</article>
										);
									})}
								</div>
							)}
						</div>
					</div>

					<aside className="catalog-side stack">
						{cartMessage ? <StatusMessage kind="info" message={cartMessage} /> : null}

						{enrollmentResults.length > 0 ? (
							<section className="subpanel stack">
								<h3>Enrollment Results</h3>
								{enrollmentResults.map((result) => (
									<StatusMessage
										key={`${result.sectionId}-${result.status}`}
										kind={result.status === 'success' ? 'success' : 'error'}
										message={`${result.courseCode}: ${result.message}`}
									/>
								))}
							</section>
						) : null}

						<section className="subpanel stack">
							<h3>Enrollment Cart</h3>
							{cartItems.length > 0 ? (
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
							) : (
								<p className="sidebar-meta">No sections selected yet. Add one from the catalog to prepare an enrollment batch.</p>
							)}
						</section>

						<section className="subpanel stack">
							<h3>Current Enrollments</h3>
							{currentEnrollments.length > 0 ? (
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
