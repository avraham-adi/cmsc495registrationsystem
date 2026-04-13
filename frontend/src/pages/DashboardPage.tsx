/*
Adi Avraham
CMSC495 Group Golf Capstone Project
DashboardPage.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders the student dashboard, weekly schedule, profile tools, and transcript-related views.
*/

import { useEffect, useMemo, useRef, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteEnrollment, updateEnrollment } from '../api/catalog';
import { StudentOnly } from '../components/AppShell.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
	loadStudentEnrollmentData,
	buildEnrichedEnrollments,
	calculateEnrollmentCredits,
	groupEnrollmentsBySemester,
	getCurrentSemester,
	type EnrichedEnrollment,
	type Event,
	buildWeeklySchedule,
	type StudentEnrollmentData,
} from '../lib/studentEnrollment.ts';
import type { Semester } from '../types/api.ts';
import { ApiError } from '../api/client.ts';
import { useWeekView } from 'react-weekview';
import { FormField } from '../components/FormField.tsx';
import { StatusMessage } from '../components/StatusMessage.tsx';
import { useSearchParams } from 'react-router-dom';
import { buildSingleParamState, normalizeEnumParam } from '../lib/queryParams.ts';
import { getErrorMessage, useFormFeedback } from '../lib/useFormFeedback.ts';

const TERM_RANK: Record<string, number> = {
	Spring: 1,
	Summer: 2,
	Fall: 3,
};

type DashboardView = 'schedule' | 'profile';
const DEV_UI_KEY = 'dashboard-dev-ui-enabled';

export function DashboardPage() {
	const scheduleScrollRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const { user, requiresPasswordChange, updateProfileAction } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null);
	const [dashboardError, setDashboardError] = useState('');
	const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
	const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
	const [schedule, setSchedule] = useState<Event[]>([]);
	const [enrollmentData, setEnrollmentData] = useState<StudentEnrollmentData | null>(null);
	const [selectedEnrollments, setSelectedEnrollments] = useState<EnrichedEnrollment[]>([]);
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const profileFeedback = useFormFeedback();
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [selectedScheduleEvent, setSelectedScheduleEvent] = useState<Event | null>(null);
	const [scheduleAccessCode, setScheduleAccessCode] = useState('');
	const [selectedTranscriptEnrollment, setSelectedTranscriptEnrollment] = useState<EnrichedEnrollment | null>(null);
	const [actionMessage, setActionMessage] = useState('');
	const [actionError, setActionError] = useState('');
	const [isUpdatingEnrollment, setIsUpdatingEnrollment] = useState(false);
	const [developerUiEnabled, setDeveloperUiEnabled] = useState(() => {
		if (typeof window === 'undefined') {
			return false;
		}

		return window.sessionStorage.getItem(DEV_UI_KEY) === 'true';
	});

	useEffect(() => {
		void loadDashboardData();
	}, [user?.role_id, requiresPasswordChange]);

	useEffect(() => {
		function handleDeveloperUiToggle(event: KeyboardEvent) {
			if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd')) {
				return;
			}

			event.preventDefault();
			setDeveloperUiEnabled((current) => {
				const next = !current;
				window.sessionStorage.setItem(DEV_UI_KEY, String(next));
				setActionError('');
				setActionMessage(next ? 'Developer tools enabled for schedule testing.' : 'Developer tools hidden.');
				return next;
			});
		}

		window.addEventListener('keydown', handleDeveloperUiToggle);
		return () => window.removeEventListener('keydown', handleDeveloperUiToggle);
	}, []);

	useEffect(() => {
		setName(user?.name ?? '');
		setEmail(user?.email ?? '');
	}, [user?.email, user?.name]);

	const uniqueSemesters = [...semesters].sort((left, right) => {
		if (left.year !== right.year) {
			return right.year - left.year;
		}

		return (TERM_RANK[right.term] ?? 0) - (TERM_RANK[left.term] ?? 0);
	});

	// Loads the student dashboard data, including semesters and enrollment context.
	async function loadDashboardData() {
		if (requiresPasswordChange) {
			setDashboardError('');
			setEnrollmentData(null);
			setSemesters([]);
			setSelectedSemesterId(null);
			setCurrentSemesterId(null);
			setSchedule([]);
			setSelectedEnrollments([]);
			setIsLoadingDashboard(false);
			return;
		}

		setIsLoadingDashboard(true);

		try {
			if (!user?.role_id) {
				return;
			}

			const loadedData = await loadStudentEnrollmentData(user.role_id);
			const nextSemesters = loadedData.semesters;

			const current = getCurrentSemester(nextSemesters);
			setCurrentSemesterId(current?.semester_id ?? null);

			setEnrollmentData(loadedData);
			setSemesters(nextSemesters);

			if (current) {
				setSelectedSemesterId((current_sel) => current_sel ?? current.semester_id);
			}
		} catch (error) {
			setDashboardError(getErrorMessage(error, 'Unable to load enrollment data right now.'));
		} finally {
			setIsLoadingDashboard(false);
		}
	}

	useEffect(() => {
		if (!enrollmentData || selectedSemesterId === null) {
			setSchedule([]);
			setSelectedEnrollments([]);
			return;
		}

		const nextEnrollments = buildEnrichedEnrollments(enrollmentData, selectedSemesterId, ['enrolled', 'completed', 'waitlisted']);
		setSelectedEnrollments(nextEnrollments);
		setSchedule(buildWeeklySchedule(nextEnrollments));
	}, [enrollmentData, selectedSemesterId]);

	const completedEnrollments = useMemo(() => (enrollmentData ? buildEnrichedEnrollments(enrollmentData, undefined, ['completed']) : []), [enrollmentData]);
	const completedTranscriptGroups = useMemo(
		() =>
			groupEnrollmentsBySemester(completedEnrollments).sort((left, right) => {
				if (left.semester.year !== right.semester.year) {
					return right.semester.year - left.semester.year;
				}

				return (TERM_RANK[right.semester.term] ?? 0) - (TERM_RANK[left.semester.term] ?? 0);
			}),
		[completedEnrollments]
	);
	const semesterCreditLoad = calculateEnrollmentCredits(selectedEnrollments.filter((entry) => entry.enrollment.status !== 'waitlisted'));
	const completedCredits = calculateEnrollmentCredits(completedEnrollments);
	const selectedSemester = uniqueSemesters.find((semester) => semester.semester_id === selectedSemesterId) ?? null;
	const activeView = normalizeEnumParam(searchParams.get('view'), ['schedule', 'profile'] as const, 'schedule');

	const { days } = useWeekView({
		initialDate: new Date(),
		minuteStep: 30,
		weekStartsOn: 1,
	});

	// Converts a day cell time into minutes from midnight for schedule layout calculations.
	function getMinutesSinceMidnight(date: Date) {
		return date.getHours() * 60 + date.getMinutes();
	}

	// SET VARIABLE IN CSS AS WELL IF CHANGED
	const visibleStartMinutes = 7 * 60;
	const visibleEndMinutes = 22 * 60;
	const scheduleStepHeight = 30;

	const visibleDays = days.map((day) => ({
		...day,
		cells: day.cells.filter((cell) => {
			const minutes = getMinutesSinceMidnight(cell.date);
			return minutes >= visibleStartMinutes && minutes < visibleEndMinutes;
		}),
	}));

	const firstDayCells = visibleDays[0]?.cells ?? [];

	// Calculates absolute positioning for a schedule event within the weekview grid.
	function eventPostion(event: Event) {
		const duration = (event.endDate.getTime() - event.startDate.getTime()) / 60000;
		const pixelsPerMinute = scheduleStepHeight / 30;
		const eventStartMinutes = event.startDate.getHours() * 60 + event.startDate.getMinutes();
		const visibleStartMinutes = 7 * 60;
		const minutesFromTop = eventStartMinutes - visibleStartMinutes;

		const durationPixels = duration * pixelsPerMinute;
		const pixelsFromTop = minutesFromTop * pixelsPerMinute;
		return {
			top: pixelsFromTop,
			height: durationPixels,
		};
	}

	// Formats a Date object into a compact display time.
	function eventDate(date: Date) {
		const d = date.toLocaleTimeString().split(':');
		const time = d[0] + ':' + d[1];
		const meridiem = ' ' + d[2].substring(3, 5);

		return time + meridiem;
	}

	useEffect(() => {
		const container = scheduleScrollRef.current;

		if (!container) {
			return;
		}

		const centeredHourMinutes = 12 * 60;
		const pixelsPerMinute = scheduleStepHeight / 30;
		const targetTop = (centeredHourMinutes - visibleStartMinutes) * pixelsPerMinute - container.clientHeight / 2;

		container.scrollTop = Math.max(0, targetTop);
	}, [selectedSemesterId]);

	function setDashboardView(view: DashboardView) {
		setSearchParams(buildSingleParamState('view', view, 'schedule'));
	}

	// Saves the student's editable profile information.
	async function submitProfile(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		profileFeedback.reset();
		setIsSavingProfile(true);

		try {
			await updateProfileAction({ name, email });
			profileFeedback.setSuccess('Profile updated successfully.');
		} catch (error) {
			profileFeedback.setErrorFromUnknown(error, 'Unable to update profile right now.');
		} finally {
			setIsSavingProfile(false);
		}
	}

	async function updateSelectedEnrollment(status: 'dropped' | 'completed') {
		if (!selectedScheduleEvent) {
			return;
		}

		setIsUpdatingEnrollment(true);
		setActionError('');
		setActionMessage('');

		try {
			await updateEnrollment(selectedScheduleEvent.enrollmentId, { status });
			setSelectedScheduleEvent(null);
			setActionMessage(status === 'completed' ? `${selectedScheduleEvent.courseCode} was marked completed.` : `${selectedScheduleEvent.courseCode} was dropped successfully.`);
			await loadDashboardData();
		} catch (error) {
			if (error instanceof ApiError) {
				setActionError(error.message);
			} else {
				setActionError(status === 'completed' ? 'Unable to mark that course completed right now.' : 'Unable to drop that course right now.');
			}
		} finally {
			setIsUpdatingEnrollment(false);
		}
	}

	async function activateSelectedWaitlistedEnrollment() {
		if (!selectedScheduleEvent) {
			return;
		}

		setIsUpdatingEnrollment(true);
		setActionError('');
		setActionMessage('');

		try {
			await updateEnrollment(selectedScheduleEvent.enrollmentId, {
				status: 'enrolled',
				code: scheduleAccessCode,
			});
			setSelectedScheduleEvent(null);
			setScheduleAccessCode('');
			setActionMessage(`${selectedScheduleEvent.courseCode} was moved from waitlist to enrolled.`);
			await loadDashboardData();
		} catch (error) {
			if (error instanceof ApiError) {
				setActionError(error.message);
			} else {
				setActionError('Unable to use that access code right now.');
			}
		} finally {
			setIsUpdatingEnrollment(false);
		}
	}

	async function removeTranscriptEnrollment() {
		if (!selectedTranscriptEnrollment) {
			return;
		}

		setIsUpdatingEnrollment(true);
		setActionError('');
		setActionMessage('');

		try {
			await deleteEnrollment(selectedTranscriptEnrollment.enrollment.enrollment_id);
			setSelectedTranscriptEnrollment(null);
			setActionMessage(`${selectedTranscriptEnrollment.section.course.course_code} was removed from the transcript.`);
			await loadDashboardData();
		} catch (error) {
			if (error instanceof ApiError) {
				setActionError(error.message);
			} else {
				setActionError('Unable to remove that completed course right now.');
			}
		} finally {
			setIsUpdatingEnrollment(false);
		}
	}

	return (
		<StudentOnly>
			<section className="panel stack dashboard-panel">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Student Workflow</p>
						<h2>Student Home</h2>
					</div>
				</div>

				<div className="dashboard-section-nav" role="tablist" aria-label="Dashboard sections">
					<button
						type="button"
						className={`dashboard-section-button ${activeView === 'schedule' ? 'active' : ''}`}
						onClick={() => setDashboardView('schedule')}
						disabled={requiresPasswordChange}
					>
						Schedule
					</button>
					<button
						type="button"
						className={`dashboard-section-button ${activeView === 'profile' ? 'active' : ''}`}
						onClick={() => setDashboardView('profile')}
						disabled={requiresPasswordChange}
					>
						Profile
					</button>
				</div>

				<div className="info-grid dashboard-info-grid">
					<div className="info-card">
						<span className="info-label">Selected Semester </span>
						<strong>{selectedSemester ? `${selectedSemester.term} ${selectedSemester.year}` : 'No semester selected'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Semester Credit Load </span>
						<strong>{selectedSemesterId === null ? '0' : semesterCreditLoad}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Registered Courses </span>
						<strong>{selectedEnrollments.length}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Completed Credits </span>
						<strong>{completedCredits} / 120</strong>
					</div>
				</div>

				{dashboardError ? <p className="messageerror">{dashboardError}</p> : null}
				{actionMessage ? <StatusMessage kind="success" message={actionMessage} /> : null}

				{activeView === 'schedule' ? (
					<section className="subpanel stack dashboard-schedule-section">
						<div className="dashboard-schedule-layout">
							<section className="dashboard-weekview">
								<div className="dashboard-weekview-toolbar">
									<label className="field" htmlFor="semester-select">
										<strong>Semester</strong>
										<select
											id="semester-select"
											value={selectedSemesterId ?? ''}
											onChange={(event) => setSelectedSemesterId(Number(event.target.value))}
											disabled={isLoadingDashboard || semesters.length === 0}
										>
											{uniqueSemesters.map((semester) => (
												<option key={semester.semester_id} value={semester.semester_id}>
													{semester.term} {semester.year}
												</option>
											))}
										</select>
									</label>
								</div>

								<div className="schedule-scroll-window" ref={scheduleScrollRef}>
									<div className="days-view">
										<div className="days-view-spacer" />
										{days.map((day) => (
											<div key={day.date.toISOString()} className="days-view-day">
												<strong>{day.shortName}</strong>
											</div>
										))}
									</div>

									<div className="schedule-body">
										<div className="schedule-time-column">
											{firstDayCells.map((cell) => (
												<div key={cell.date.toISOString()} className="schedule-time-cell">
													{eventDate(cell.date)}
												</div>
											))}
										</div>

										<div className="schedule-grid">
											{visibleDays.map((day, dayIndex) => (
												<div key={day.date.toISOString()} className="schedule-day-column">
													{day.cells.map((cell) => (
														<button key={cell.date.toISOString()} type="button" className="schedule-grid-cell" />
													))}

													<div className="schedule-events-layer">
														{schedule
															.filter((event) => event.weekdayIndex === dayIndex)
															.map((event) => (
																<button
																	key={event.id}
																	type="button"
																	className={`schedule-event schedule-event-button ${event.status === 'waitlisted' ? 'schedule-event-waitlisted' : ''} ${event.status === 'completed' ? 'schedule-event-completed' : ''}`}
																	style={eventPostion(event)}
																	onClick={() => {
																		setActionError('');
																		setScheduleAccessCode('');
																		setSelectedScheduleEvent(event);
																	}}
																>
																	<strong>
																		{event.courseCode} - #{event.sectionId}
																	</strong>
																	<span className="schedule-event-title">{event.title}</span>
																</button>
															))}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>

								<section className="schedule-debug-panel">
									<div className="panel-header">
										<div>
											<p className="eyebrow">Temporary Debug</p>
											<h3>Computed Schedule Events</h3>
										</div>
									</div>
									<pre className="schedule-debug-output">
										{JSON.stringify(
											schedule.map((event) => ({
												id: event.id,
												courseCode: event.courseCode,
												weekdayIndex: event.weekdayIndex,
												startDate: event.startDate.toString(),
												endDate: event.endDate.toString(),
												scheduleText: event.scheduleText,
											})),
											null,
											2
										)}
									</pre>
								</section>
							</section>

							<aside className="dashboard-completed-column">
								<section className="dashboard-completed-panel">
									<div className="panel-header">
										<div>
											<p className="eyebrow">Completed Courses</p>
											<h3>Transcript</h3>
										</div>
									</div>

									<div className="dashboard-completed-summary">
										<span className="info-label">Credits Completed</span>
										<strong>{completedCredits} / 120</strong>
										{developerUiEnabled ? <span className="dashboard-dev-pill">Developer Tools Enabled</span> : null}
									</div>

									<div className="dashboard-completed-list">
										{isLoadingDashboard ? (
											<p className="sidebar-copy">Loading completed courses...</p>
										) : completedTranscriptGroups.length > 0 ? (
											completedTranscriptGroups.map((group) => (
												<details key={group.semester.semester_id} className="dashboard-completed-group">
													<summary className="dashboard-completed-group-header">
														<strong>
															{group.semester.term} {group.semester.year}
														</strong>
														<span>{group.totalCredits} Credits</span>
													</summary>

													<div className="dashboard-completed-items">
														{group.items.map((entry) => (
															<article key={entry.enrollment.enrollment_id} className="dashboard-completed-item">
																<div>
																	<strong>{entry.section.course.course_code}</strong>
																	<br></br>
																	<span>{entry.section.course.title}</span>
																</div>
																<div className="dashboard-completed-item-actions">
																	<em>{entry.section.course.credits} Credits</em>
																	{developerUiEnabled ? (
																		<button
																			type="button"
																			className="pill-button"
																			onClick={() => {
																				setActionError('');
																				setSelectedTranscriptEnrollment(entry);
																			}}
																		>
																			Remove
																		</button>
																	) : null}
																</div>
															</article>
														))}
													</div>
												</details>
											))
										) : (
											<p className="sidebar-copy">No completed courses found.</p>
										)}
									</div>
								</section>
							</aside>
						</div>
					</section>
				) : null}

				{activeView === 'profile' ? (
					<section className="subpanel stack">
						<div className="panel-header">
							<div>
								<p className="eyebrow">Current User</p>
								<h3>Profile</h3>
							</div>
							<div className="pill-row">
								<span className="pill">{user?.role}</span>
								<span className="pill subtle">{user?.role_details}</span>
							</div>
						</div>

						<form className="stack" onSubmit={submitProfile}>
							<FormField id="name" label="Name" value={name} onChange={setName} required />
							<FormField id="profile-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />

							{profileFeedback.feedback.message ? <StatusMessage kind="success" message={profileFeedback.feedback.message} /> : null}
							{profileFeedback.feedback.error ? <StatusMessage kind="error" message={profileFeedback.feedback.error} /> : null}

							<button type="submit" className="primary-button" disabled={isSavingProfile || requiresPasswordChange}>
								{isSavingProfile ? 'Saving...' : 'Save Profile'}
							</button>
							<button type="button" className="secondary-button" onClick={() => navigate('/change-password')}>
								Change Password
							</button>
						</form>
					</section>
				) : null}
			</section>

			{selectedScheduleEvent ? (
				<div className="dialog-backdrop" role="presentation" onClick={() => (isUpdatingEnrollment ? null : setSelectedScheduleEvent(null))}>
					<section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="drop-course-title" onClick={(event) => event.stopPropagation()}>
						<div className="panel-header">
							<div>
								<p className="eyebrow">Schedule Actions</p>
								<h3 id="drop-course-title">Manage Course Status</h3>
							</div>
						</div>

						<div className="stack">
							<p>
								<strong>{selectedScheduleEvent.courseCode}</strong>
								<br />
								{selectedScheduleEvent.title}
							</p>
							<p className="sidebar-meta">{selectedScheduleEvent.scheduleText}</p>
							{selectedScheduleEvent.status === 'waitlisted' ? (
								<>
									{selectedSemesterId === currentSemesterId ? (
										<>
											<p className="sidebar-meta">This course is waitlisted. Enter a valid access code to move into an open seat, or drop it.</p>
											<FormField id="waitlist-access-code" label="Access Code" value={scheduleAccessCode} onChange={setScheduleAccessCode} placeholder="A3F1-9C4B" />
										</>
									) : (
										<p className="sidebar-meta">Access codes are not available for previous semesters. This course is view-only.</p>
									)}
								</>
							) : selectedScheduleEvent.status === 'completed' ? (
								<p className="sidebar-meta">Completed courses are shown here for schedule history only.</p>
							) : (
								<>
									<p className="sidebar-meta">Dropping this course removes it from your current schedule.</p>
									{developerUiEnabled ? <p className="sidebar-meta">Developer mode is enabled. Completion testing controls are available for this enrolled course.</p> : null}
								</>
							)}
							{actionError ? <StatusMessage kind="error" message={actionError} /> : null}
						</div>

						<div className="dialog-actions">
							<button type="button" className="secondary-button" onClick={() => setSelectedScheduleEvent(null)} disabled={isUpdatingEnrollment}>
								Cancel
							</button>
							{selectedScheduleEvent.status === 'waitlisted' ? (
								<>
									<button
										type="button"
										className="secondary-button"
										onClick={() => void activateSelectedWaitlistedEnrollment()}
										disabled={isUpdatingEnrollment || scheduleAccessCode.trim() === '' || selectedSemesterId !== currentSemesterId}
									>
										{isUpdatingEnrollment ? 'Updating...' : 'Use Access Code'}
									</button>
									<button type="button" className="primary-button" onClick={() => void updateSelectedEnrollment('dropped')} disabled={isUpdatingEnrollment}>
										{isUpdatingEnrollment ? 'Updating...' : 'Drop Course'}
									</button>
								</>
							) : selectedScheduleEvent.status === 'completed' ? null : (
								<>
									{developerUiEnabled ? (
										<button type="button" className="secondary-button" onClick={() => void updateSelectedEnrollment('completed')} disabled={isUpdatingEnrollment}>
											{isUpdatingEnrollment ? 'Updating...' : 'Mark Completed'}
										</button>
									) : null}
									<button type="button" className="primary-button" onClick={() => void updateSelectedEnrollment('dropped')} disabled={isUpdatingEnrollment}>
										{isUpdatingEnrollment ? 'Updating...' : 'Drop Course'}
									</button>
								</>
							)}
						</div>
					</section>
				</div>
			) : null}

			{selectedTranscriptEnrollment && developerUiEnabled ? (
				<div className="dialog-backdrop" role="presentation" onClick={() => (isUpdatingEnrollment ? null : setSelectedTranscriptEnrollment(null))}>
					<section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="remove-transcript-title" onClick={(event) => event.stopPropagation()}>
						<div className="panel-header">
							<div>
								<p className="eyebrow">Transcript Actions</p>
								<h3 id="remove-transcript-title">Remove Completed Course</h3>
							</div>
						</div>

						<div className="stack">
							<p>
								<strong>{selectedTranscriptEnrollment.section.course.course_code}</strong>
								<br />
								{selectedTranscriptEnrollment.section.course.title}
							</p>
							<p className="sidebar-meta">
								{selectedTranscriptEnrollment.section.semester.term} {selectedTranscriptEnrollment.section.semester.year}
							</p>
							<p className="sidebar-meta">Developer mode only. Transcript removal is exposed for local testing and is not part of the student workflow.</p>
							{actionError ? <StatusMessage kind="error" message={actionError} /> : null}
						</div>

						<div className="dialog-actions">
							<button type="button" className="secondary-button" onClick={() => setSelectedTranscriptEnrollment(null)} disabled={isUpdatingEnrollment}>
								Cancel
							</button>
							<button type="button" className="primary-button" onClick={() => void removeTranscriptEnrollment()} disabled={isUpdatingEnrollment}>
								{isUpdatingEnrollment ? 'Removing...' : 'Remove Course'}
							</button>
						</div>
					</section>
				</div>
			) : null}
		</StudentOnly>
	);
}
