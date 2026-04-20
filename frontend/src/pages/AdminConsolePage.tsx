/*
Adi Avraham
CMSC495 Group Golf Capstone Project
AdminConsolePage.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders the admin home and management workflows for users, courses, prerequisites, semesters, and sections.
*/

import { useEffect, useMemo, useState, type FormEvent, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminListShell } from '../components/AdminListShell';
import { AdminOnly } from '../components/AppShell';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { formatDayCombination, formatTimeRange } from '../lib/studentEnrollment';
import { buildSingleParamState, hasQueryParam, normalizeEnumParam } from '../lib/queryParams';
import { getErrorMessage, useFormFeedback } from '../lib/useFormFeedback';
import {
	createCourse,
	createPrerequisite,
	createSection,
	createSemester,
	createUser,
	deleteCourse,
	deletePrerequisite,
	deleteSection,
	deleteSemester,
	deleteUser,
	listCourses,
	listPrerequisites,
	listSections,
	listSemesters,
	listUsers,
	updateCourse,
	updateSection,
	updateUserRole,
} from '../api/admin';
import type { AdminUserCreatePayload, Course, Meta, Prerequisite, Section, Semester, User, UserRole } from '../types/api';

type AdminArea = 'home' | 'tools';
type AdminHomeView = 'overview' | 'profile' | 'password';
type AdminToolView = 'users' | 'courses' | 'prerequisites' | 'semesters' | 'sections';

type AdminDataState = {
	users: User[];
	professors: User[];
	courses: Course[];
	semesters: Semester[];
	sections: Section[];
};

type UserFormState = {
	name: string;
	email: string;
	type: UserRole;
	detail: string;
};

type CourseFormState = {
	courseId: number | null;
	code: string;
	title: string;
	desc: string;
	cred: string;
};

type SemesterFormState = {
	term: string;
	year: string;
};

type Meridiem = 'AM' | 'PM';

type SectionFormState = {
	sectionId: number | null;
	courseId: string;
	semId: string;
	profId: string;
	capacity: string;
	selectedDays: string[];
	isAsync: boolean;
	startHour: string;
	startMinute: string;
	startMeridiem: Meridiem;
	endHour: string;
	endMinute: string;
	endMeridiem: Meridiem;
};

type PaginationState = {
	page: number;
	pageSize: number;
};

type FlashMessage = {
	id: number;
	kind: 'success' | 'error' | 'info';
	message: string;
};

type PaginatedResult<T> = {
	items: T[];
	meta: Meta;
};

type UserResponsePayload = User | { User: User };
type CourseResponsePayload = Course | { Course: Course };

const EMPTY_ADMIN_DATA: AdminDataState = {
	users: [],
	professors: [],
	courses: [],
	semesters: [],
	sections: [],
};

const DEFAULT_USER_FORM: UserFormState = {
	name: '',
	email: '',
	type: 'STUDENT',
	detail: '',
};

const DEFAULT_COURSE_FORM: CourseFormState = {
	courseId: null,
	code: '',
	title: '',
	desc: '',
	cred: '3',
};

const DEFAULT_SEMESTER_FORM: SemesterFormState = {
	term: '',
	year: String(new Date().getFullYear()),
};

const TERM_OPTIONS = ['Fall', 'Spring', 'Summer'] as const;
const DAY_OPTIONS = [
	{ value: 'M', label: 'Mon' },
	{ value: 'T', label: 'Tue' },
	{ value: 'W', label: 'Wed' },
	{ value: 'R', label: 'Thu' },
	{ value: 'F', label: 'Fri' },
	{ value: 'S', label: 'Sat' },
	{ value: 'U', label: 'Sun' },
	{ value: 'async', label: 'Async' },
] as const;

const SUBJECT_DEPARTMENT_MAP: Record<string, string> = {
	CMSC: 'Computer Science',
	'COMPUTER SCIENCE': 'Computer Science',
	MATH: 'Mathematics',
	MATHEMATICS: 'Mathematics',
	ENGL: 'English',
	ENGLISH: 'English',
	HIST: 'History',
	HISTORY: 'History',
	PHYS: 'Physics',
	PHYSICS: 'Physics',
	CHEM: 'Chemistry',
	CHEMISTRY: 'Chemistry',
	NURS: 'Nursing',
	NURSING: 'Nursing',
	IFSM: 'Information Systems Management',
	'INFORMATION SYSTEMS MANAGEMENT': 'Information Systems Management',
};

const DEFAULT_SECTION_FORM: SectionFormState = {
	sectionId: null,
	courseId: '',
	semId: '',
	profId: '',
	capacity: '25',
	selectedDays: [],
	isAsync: false,
	startHour: '',
	startMinute: '',
	startMeridiem: 'AM',
	endHour: '',
	endMinute: '',
	endMeridiem: 'AM',
};

const ROLE_DETAIL_LABEL: Record<UserRole, string> = {
	ADMIN: 'Access Level',
	PROFESSOR: 'Department',
	STUDENT: 'Major',
};

function toTimeValue(value: string | null) {
	return value ? value.slice(0, 8) : '';
}

function AdminFieldLabel({ label }: { label: string; required?: boolean }) {
	return <span>{label}</span>;
}

function unwrapUser(payload: UserResponsePayload) {
	return 'User' in payload ? payload.User : payload;
}

function inferCourseSubject(courseCode: string) {
	const match = courseCode.match(/^[A-Za-z]+/);
	return match ? match[0].toUpperCase() : '';
}

function normalizeCourseRecord(course: Course, fallback?: Course | null): Course {
	return {
		...fallback,
		...course,
		subject: course.subject ?? fallback?.subject ?? inferCourseSubject(course.course_code),
	};
}

function unwrapCourse(payload: CourseResponsePayload, fallback?: Course | null) {
	const course = 'Course' in payload ? payload.Course : payload;
	return normalizeCourseRecord(course, fallback);
}

function sortUsers(users: User[]) {
	return [...users].sort((left, right) => left.name.localeCompare(right.name) || left.id - right.id);
}

function sortCourses(courses: Course[]) {
	return [...courses].sort((left, right) => left.course_code.localeCompare(right.course_code) || left.course_id - right.course_id);
}

function getCanonicalDayCombination(days: string[]) {
	const selectedDays = new Set(days);
	return DAY_OPTIONS.filter((option) => selectedDays.has(option.value))
		.map((option) => option.value)
		.join('');
}

function parseDayCombination(days: string | null) {
	if (!days || days === 'async') {
		return [];
	}

	return DAY_OPTIONS.map((option) => option.value).filter((day) => days.includes(day));
}

function parseTimeParts(value: string | null) {
	if (!value) {
		return { hour: '', minute: '', meridiem: 'AM' as Meridiem };
	}

	const [hoursText, minutesText] = toTimeValue(value).split(':');
	const hours24 = Number(hoursText);
	const hour12 = hours24 % 12 || 12;

	return {
		hour: String(hour12),
		minute: minutesText,
		meridiem: hours24 >= 12 ? ('PM' as const) : ('AM' as const),
	};
}

function buildTimeValue(hour: string, minute: string, meridiem: Meridiem) {
	const trimmedHour = hour.trim();
	const trimmedMinute = minute.trim();

	if (trimmedHour === '' || trimmedMinute === '') {
		return { value: undefined, error: 'Both hour and minute are required.' };
	}

	if (!/^\d{1,2}$/.test(trimmedHour)) {
		return { value: undefined, error: 'Hour must be a number from 1 to 12.' };
	}

	if (!/^\d{1,2}$/.test(trimmedMinute)) {
		return { value: undefined, error: 'Minute must be a number from 0 to 59.' };
	}

	const numericHour = Number(trimmedHour);
	const numericMinute = Number(trimmedMinute);

	if (numericHour < 1 || numericHour > 12) {
		return { value: undefined, error: 'Hour must be a number from 1 to 12.' };
	}

	if (numericMinute < 0 || numericMinute > 59) {
		return { value: undefined, error: 'Minute must be a number from 0 to 59.' };
	}

	const hours24 = meridiem === 'PM' ? (numericHour % 12) + 12 : numericHour % 12;
	return {
		value: `${String(hours24).padStart(2, '0')}:${String(numericMinute).padStart(2, '0')}:00`,
		error: null,
	};
}

function formatTimePickerValue(hour: string, minute: string, meridiem: Meridiem) {
	const built = buildTimeValue(hour, minute, meridiem);
	return built.value ? built.value.slice(0, 5) : '';
}

function applyTimePickerValue(value: string) {
	if (!/^\d{2}:\d{2}$/.test(value)) {
		return { hour: '', minute: '', meridiem: 'AM' as Meridiem };
	}

	const [hoursText, minute] = value.split(':');
	const hours24 = Number(hoursText);
	const hour12 = hours24 % 12 || 12;

	return {
		hour: String(hour12),
		minute,
		meridiem: hours24 >= 12 ? ('PM' as const) : ('AM' as const),
	};
}

function resolveCourseDepartment(course: Course | null) {
	if (!course) {
		return null;
	}

	const rawSubject = (course.subject ?? inferCourseSubject(course.course_code)).trim();
	if (rawSubject === '') {
		return null;
	}

	return SUBJECT_DEPARTMENT_MAP[rawSubject.toUpperCase()] ?? SUBJECT_DEPARTMENT_MAP[inferCourseSubject(course.course_code)] ?? rawSubject;
}

function getSectionMeetingLabel(days: string) {
	return days === 'async' ? 'Asynchronous' : formatDayCombination(days);
}

// Slices an in-memory list into a consistent page payload for local pagination.
function paginateItems<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
	const total = items.length;
	const totalPages = Math.max(Math.ceil(total / pageSize), 1);
	const safePage = Math.min(Math.max(page, 1), totalPages);
	const start = (safePage - 1) * pageSize;

	return {
		items: items.slice(start, start + pageSize),
		meta: {
			page: safePage,
			limit: pageSize,
			total,
			totalPages,
		},
	};
}

// Stores local pagination state for admin lists while resetting page on page-size changes.
function useLocalPagination(initialPageSize = 10) {
	const [state, setState] = useState<PaginationState>({
		page: 1,
		pageSize: initialPageSize,
	});

	return {
		page: state.page,
		pageSize: state.pageSize,
		setPage(page: number) {
			setState((current) => ({ ...current, page }));
		},
		setPageSize(pageSize: number) {
			setState({ page: 1, pageSize });
		},
		reset() {
			setState((current) => ({ ...current, page: 1 }));
		},
	};
}

function AdminTimeField({
	idPrefix,
	label,
	hour,
	minute,
	meridiem,
	onHourChange,
	onMinuteChange,
	onMeridiemChange,
	required = false,
	disabled = false,
}: {
	idPrefix: string;
	label: string;
	hour: string;
	minute: string;
	meridiem: Meridiem;
	onHourChange: (value: string) => void;
	onMinuteChange: (value: string) => void;
	onMeridiemChange: (value: Meridiem) => void;
	required?: boolean;
	disabled?: boolean;
}) {
	return (
		<div className="field">
			<AdminFieldLabel label={label} required={required} />
			<div className="admin-time-input-row">
				<input
					id={idPrefix}
					type="time"
					step="60"
					value={formatTimePickerValue(hour, minute, meridiem)}
					onChange={(event) => {
						const next = applyTimePickerValue(event.target.value);
						onHourChange(next.hour);
						onMinuteChange(next.minute);
						onMeridiemChange(next.meridiem);
					}}
					aria-label={label}
					required={required}
					disabled={disabled}
				/>
			</div>
		</div>
	);
}

// Loads every page of users into one client-side list for local admin filtering and paging.
async function fetchAllUsers(role?: UserRole) {
	return fetchAllPaginated(
		(page) => listUsers({ page, limit: 100, role: role ?? '' }),
		(response) => response.User.map((entry) => entry.User)
	);
}

// Loads every course into one client-side list for local admin filtering and paging.
async function fetchAllCourses() {
	return fetchAllPaginated(
		(page) => listCourses({ page, limit: 100 }),
		(response) => response.Course.map((entry) => entry.Course)
	);
}

// Loads every section into one client-side list for local admin filtering and paging.
async function fetchAllSections() {
	return fetchAllPaginated(
		(page) => listSections({ page, limit: 100 }),
		(response) => response.Section.map((entry) => entry.Section)
	);
}

// Iterates a paginated backend endpoint until every item has been collected locally.
async function fetchAllPaginated<T, TResponse extends { Meta: Meta }>(loadPage: (page: number) => Promise<TResponse>, mapItems: (response: TResponse) => T[]) {
	const items: T[] = [];
	let page = 1;
	let totalPages = 1;

	while (page <= totalPages) {
		const response = await loadPage(page);
		items.push(...mapItems(response));
		totalPages = response.Meta.totalPages;
		page += 1;
	}

	return items;
}

export function AdminConsolePage({ area = 'home' }: { area?: AdminArea }) {
	const navigate = useNavigate();
	const { user, requiresPasswordChange, updateProfileAction, changePasswordAction, refreshUser } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [data, setData] = useState<AdminDataState>(EMPTY_ADMIN_DATA);
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const profileFeedback = useFormFeedback();
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const passwordFeedback = useFormFeedback();
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const activeHomeView = normalizeEnumParam(searchParams.get('view'), ['overview', 'profile', 'password'] as const, 'overview');
	const activeToolView = normalizeEnumParam(searchParams.get('tool'), ['users', 'courses', 'prerequisites', 'semesters', 'sections'] as const, 'users');
	const activeArea: AdminArea = hasQueryParam(searchParams, 'tool') ? 'tools' : area;

	useEffect(() => {
		void loadAdminData();
	}, []);

	useEffect(() => {
		setName(user?.name ?? '');
		setEmail(user?.email ?? '');
	}, [user?.email, user?.name]);

	// Loads the admin datasets used by the home and tool views.
	async function loadAdminData(options?: { silent?: boolean }) {
		if (!options?.silent) {
			setIsLoading(true);
		}

		setLoadError('');

		try {
			const [users, professors, courses, semestersResponse, sections] = await Promise.all([fetchAllUsers(), fetchAllUsers('PROFESSOR'), fetchAllCourses(), listSemesters(), fetchAllSections()]);

			setData({
				users,
				professors,
				courses,
				semesters: semestersResponse.map((entry) => entry.Semester),
				sections,
			});
		} catch (error) {
			setLoadError(getErrorMessage(error, 'Unable to load administration data right now.'));
		} finally {
			setIsLoading(false);
		}
	}

	// Reloads the admin datasets without showing the initial loading state again.
	async function refreshAdminData() {
		await loadAdminData({ silent: true });
	}

	function applyUserUpsert(nextUser: User) {
		setData((current) => {
			const users = sortUsers([...current.users.filter((entry) => entry.id !== nextUser.id), nextUser]);
			const professors =
				nextUser.role === 'PROFESSOR'
					? sortUsers([...current.professors.filter((entry) => entry.id !== nextUser.id), nextUser])
					: current.professors.filter((entry) => entry.id !== nextUser.id);

			return {
				...current,
				users,
				professors,
			};
		});
	}

	function applyUserRemoval(userId: number) {
		setData((current) => ({
			...current,
			users: current.users.filter((entry) => entry.id !== userId),
			professors: current.professors.filter((entry) => entry.id !== userId),
		}));
	}

	function applyCourseUpsert(nextCourse: Course) {
		setData((current) => ({
			...current,
			courses: sortCourses([...current.courses.filter((entry) => entry.course_id !== nextCourse.course_id), normalizeCourseRecord(nextCourse)]),
		}));
	}

	function applyCourseRemoval(courseId: number) {
		setData((current) => ({
			...current,
			courses: current.courses.filter((entry) => entry.course_id !== courseId),
		}));
	}

	// Switches the Admin Home subview while keeping query params normalized.
	function setAdminHomeView(view: AdminHomeView) {
		setSearchParams(buildSingleParamState('view', view, 'overview'));
	}

	// Switches the Admin Tools subview while keeping query params normalized.
	function setAdminToolView(view: AdminToolView) {
		setSearchParams({ tool: view });
	}

	// Saves the current admin user's editable profile information.
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

	// Updates the current admin user's password and refreshes the app session.
	async function submitPassword(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		passwordFeedback.reset();
		const wasFirstLogin = requiresPasswordChange;

		if (password !== confirmPassword) {
			passwordFeedback.setError('Passwords do not match.');
			return;
		}

		setIsSavingPassword(true);

		try {
			const refreshedUser = await changePasswordAction({ password });
			await refreshUser();
			setPassword('');
			setConfirmPassword('');
			passwordFeedback.setSuccess('Password updated successfully.');
			setAdminHomeView('overview');

			if (wasFirstLogin) {
				const firstLoginDestination = refreshedUser.role === 'ADMIN' ? '/console/admin' : '/';

				if (window.location.pathname === firstLoginDestination) {
					window.location.reload();
				} else {
					window.location.assign(firstLoginDestination);
				}
				return;
			}

			navigate('/console/admin', { replace: true });
			return;
		} catch (error) {
			passwordFeedback.setErrorFromUnknown(error, 'Unable to change password right now.');
		} finally {
			setIsSavingPassword(false);
		}
	}

	return (
		<AdminOnly>
			<section className="panel stack dashboard-panel admin-console-panel">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Administration</p>
						<h2>{activeArea === 'home' ? 'Admin Home' : 'Admin Tools'}</h2>
					</div>
					<span className="pill subtle">Hard Delete Enabled</span>
				</div>

				<div className="info-grid dashboard-info-grid">
					<div className="info-card">
						<span className="info-label">Administrator</span>
						<strong>{user?.name ?? 'Unknown user'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Users</span>
						<strong>{data.users.length}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Courses</span>
						<strong>{data.courses.length}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Sections</span>
						<strong>{data.sections.length}</strong>
					</div>
				</div>

				{activeArea === 'home' ? (
					<div className="dashboard-section-nav" role="tablist" aria-label="Admin home sections">
						<button
							type="button"
							className={`dashboard-section-button ${activeHomeView === 'overview' ? 'active' : ''}`}
							onClick={() => setAdminHomeView('overview')}
							disabled={requiresPasswordChange}
						>
							Overview
						</button>
						<button
							type="button"
							className={`dashboard-section-button ${activeHomeView === 'profile' ? 'active' : ''}`}
							onClick={() => setAdminHomeView('profile')}
							disabled={requiresPasswordChange}
						>
							Profile
						</button>
					</div>
				) : (
					<div className="dashboard-section-nav" role="tablist" aria-label="Admin tool sections">
						{(['users', 'courses', 'prerequisites', 'semesters', 'sections'] as AdminToolView[]).map((view) => (
							<button key={view} type="button" className={`dashboard-section-button ${activeToolView === view ? 'active' : ''}`} onClick={() => setAdminToolView(view)}>
								{view === 'prerequisites' ? 'Prereqs' : view.charAt(0).toUpperCase() + view.slice(1)}
							</button>
						))}
					</div>
				)}

				{isLoading ? <p className="sidebar-copy">Loading administration data...</p> : null}
				{loadError ? <StatusMessage kind="error" message={loadError} /> : null}

				{!isLoading && !loadError && activeArea === 'home' && activeHomeView === 'overview' ? <AdminOverview data={data} /> : null}
				{!isLoading && !loadError && activeArea === 'home' && activeHomeView === 'profile' ? (
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
							<FormField id="admin-name" label="Name" value={name} onChange={setName} required />
							<FormField id="admin-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
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
				{!isLoading && !loadError && activeArea === 'home' && activeHomeView === 'password' ? (
					<section className="subpanel stack">
						<div className="panel-header">
							<div>
								<p className="eyebrow">Authentication</p>
								<h3>Change Password</h3>
							</div>
						</div>
						{requiresPasswordChange ? <StatusMessage kind="info" message="It appears to be your first time logging in. Password change is mandatory." /> : null}
						<form className="stack" onSubmit={submitPassword}>
							<FormField id="admin-new-password" label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
							<FormField
								id="admin-confirm-password"
								label="Confirm Password"
								type="password"
								value={confirmPassword}
								onChange={setConfirmPassword}
								autoComplete="new-password"
								required
							/>
							<p className="hint">
								Password requires:
								<br /> - at least 8 characters
								<br /> - 1 upper/lowercase
								<br /> - 1 number
								<br /> - 1 special character
								<br /> - cannot contain the email address
							</p>
							{passwordFeedback.feedback.message ? <StatusMessage kind="success" message={passwordFeedback.feedback.message} /> : null}
							{passwordFeedback.feedback.error ? <StatusMessage kind="error" message={passwordFeedback.feedback.error} /> : null}
							<button type="submit" className="primary-button" disabled={isSavingPassword}>
								{isSavingPassword ? 'Updating...' : 'Update Password'}
							</button>
						</form>
					</section>
				) : null}

				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'users' ? (
					<AdminUsersView users={data.users} onReload={refreshAdminData} onUserSaved={applyUserUpsert} onUserDeleted={applyUserRemoval} />
				) : null}
				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'courses' ? (
					<AdminCoursesView courses={data.courses} onReload={refreshAdminData} onCourseSaved={applyCourseUpsert} onCourseDeleted={applyCourseRemoval} />
				) : null}
				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'prerequisites' ? <AdminPrerequisitesView courses={data.courses} /> : null}
				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'semesters' ? <AdminSemestersView semesters={data.semesters} onReload={refreshAdminData} /> : null}
				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'sections' ? (
					<AdminSectionsView courses={data.courses} professors={data.professors} semesters={data.semesters} sections={data.sections} onReload={refreshAdminData} />
				) : null}
			</section>
		</AdminOnly>
	);
}

function AdminOverview({ data }: { data: AdminDataState }) {
	return (
		<section className="admin-grid">
			<div className="subpanel stack">
				<h3>Admin Home</h3>
				<p className="sidebar-copy">
					Use the Admin Home to manage your profile and authentication. Open Admin Tools to manage users, courses, prerequisites, semesters, and section offerings.
				</p>
			</div>
			<div className="subpanel stack">
				<h3>Current Inventory</h3>
				<p className="sidebar-copy">
					The current environment includes {data.users.length} users, {data.courses.length} courses, {data.semesters.length} semesters, and {data.sections.length} sections.
				</p>
			</div>
		</section>
	);
}

function AdminUsersView({ users, onReload, onUserSaved, onUserDeleted }: { users: User[]; onReload: () => Promise<void>; onUserSaved: (user: User) => void; onUserDeleted: (userId: number) => void }) {
	const [userSearch, setUserSearch] = useState('');
	const [form, setForm] = useState<UserFormState>(DEFAULT_USER_FORM);
	const createFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	const filteredUsers = useMemo(() => {
		const term = userSearch.trim().toLowerCase();
		if (term === '') return users;
		return users.filter((entry) => `${entry.name} ${entry.email} ${entry.role} ${entry.role_details}`.toLowerCase().includes(term));
	}, [userSearch, users]);

	const paginated = useMemo(() => paginateItems(filteredUsers, pagination.page, pagination.pageSize), [filteredUsers, pagination.page, pagination.pageSize]);

	useEffect(() => {
		pagination.reset();
	}, [userSearch]);

	async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			const payload: AdminUserCreatePayload = { name: form.name, email: form.email, type: form.type, detail: form.detail };
			const createdUser = unwrapUser(await createUser(payload));
			onUserSaved(createdUser);
			setForm(DEFAULT_USER_FORM);
			createFeedback.setSuccess('User created successfully.');
			void onReload();
		} catch (error) {
			createFeedback.setErrorFromUnknown(error, 'Unable to create that user.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>Create User</h3>
				<form className="stack" onSubmit={handleCreateUser}>
					<FormField id="admin-user-name" label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required showRequiredMarker />
					<FormField
						id="admin-user-email"
						label="Email"
						type="email"
						value={form.email}
						onChange={(value) => setForm((current) => ({ ...current, email: value }))}
						required
						showRequiredMarker
					/>
					<label className="field" htmlFor="admin-user-type">
						<AdminFieldLabel label="Role" required />
						<select id="admin-user-type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as UserRole, detail: '' }))}>
							<option value="STUDENT">Student</option>
							<option value="PROFESSOR">Professor</option>
							<option value="ADMIN">Admin</option>
						</select>
					</label>
					<FormField
						id="admin-user-detail"
						label={ROLE_DETAIL_LABEL[form.type]}
						value={form.detail}
						onChange={(value) => setForm((current) => ({ ...current, detail: value }))}
						required
						showRequiredMarker
					/>
					{createFeedback.feedback.message ? <StatusMessage kind="success" message={createFeedback.feedback.message} /> : null}
					{createFeedback.feedback.error ? <StatusMessage kind="error" message={createFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">
						Create User
					</button>
				</form>
			</section>

			<AdminListShell
				searchId="admin-user-search"
				searchValue={userSearch}
				onSearchChange={setUserSearch}
				searchPlaceholder="Name, email, role, detail"
				pageSizeId="admin-user-page-size"
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.setPageSize}
				meta={paginated.meta}
				setPage={pagination.setPage}
			>
				<div className="admin-card-list">
					{paginated.items.map((entry) => (
						<UserCard key={entry.id} user={entry} onReload={onReload} onUserSaved={onUserSaved} onUserDeleted={onUserDeleted} />
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminCoursesView({
	courses,
	onReload,
	onCourseSaved,
	onCourseDeleted,
}: {
	courses: Course[];
	onReload: () => Promise<void>;
	onCourseSaved: (course: Course) => void;
	onCourseDeleted: (courseId: number) => void;
}) {
	const [courseSearch, setCourseSearch] = useState('');
	const [form, setForm] = useState<CourseFormState>(DEFAULT_COURSE_FORM);
	const saveFeedback = useFormFeedback();
	const deleteFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	const filteredCourses = useMemo(() => {
		const term = courseSearch.trim().toLowerCase();
		if (term === '') return courses;
		return courses.filter((entry) => `${entry.course_code} ${entry.title} ${entry.description} ${entry.subject}`.toLowerCase().includes(term));
	}, [courseSearch, courses]);

	const paginated = useMemo(() => paginateItems(filteredCourses, pagination.page, pagination.pageSize), [filteredCourses, pagination.page, pagination.pageSize]);
	const selectedCourse = courses.find((entry) => entry.course_id === form.courseId) ?? null;

	useEffect(() => {
		pagination.reset();
	}, [courseSearch]);

	async function handleSaveCourse(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			const payload = { code: form.code, title: form.title, desc: form.desc, cred: Number(form.cred) };
			if (form.courseId) {
				const updatedCourse = unwrapCourse(await updateCourse(form.courseId, payload), selectedCourse);
				onCourseSaved(updatedCourse);
				saveFeedback.setSuccess(`Updated ${selectedCourse?.course_code ?? 'course'} successfully.`);
			} else {
				const createdCourse = unwrapCourse(await createCourse(payload));
				onCourseSaved(createdCourse);
				saveFeedback.setSuccess('Course created successfully.');
			}
			setForm(DEFAULT_COURSE_FORM);
			void onReload();
		} catch (error) {
			saveFeedback.setErrorFromUnknown(error, 'Unable to save that course.');
		}
	}

	async function handleDeleteCourse(course: Course) {
		try {
			await deleteCourse(course.course_id);
			onCourseDeleted(course.course_id);
			deleteFeedback.setSuccess(`${course.course_code} deleted successfully.`);
			void onReload();
		} catch (error) {
			deleteFeedback.setErrorFromUnknown(error, 'Unable to delete that course.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>{form.courseId ? 'Edit Course' : 'Create Course'}</h3>
				<form className="stack" onSubmit={handleSaveCourse}>
					<FormField
						id="course-code"
						label="Course Code"
						value={form.code}
						onChange={(value) => setForm((current) => ({ ...current, code: value.toUpperCase() }))}
						required
						showRequiredMarker
					/>
					<FormField id="course-title" label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required showRequiredMarker />
					<label className="field" htmlFor="course-desc">
						<AdminFieldLabel label="Description" required />
						<textarea id="course-desc" className="admin-textarea" value={form.desc} onChange={(event) => setForm((current) => ({ ...current, desc: event.target.value }))} required />
					</label>
					<FormField
						id="course-credits"
						label="Credits"
						type="number"
						value={form.cred}
						onChange={(value) => setForm((current) => ({ ...current, cred: value }))}
						required
						showRequiredMarker
					/>
					{saveFeedback.feedback.message ? <StatusMessage kind="success" message={saveFeedback.feedback.message} /> : null}
					{saveFeedback.feedback.error ? <StatusMessage kind="error" message={saveFeedback.feedback.error} /> : null}
					<div className="admin-action-row">
						<button type="submit" className="primary-button">
							{form.courseId ? 'Save Course' : 'Create Course'}
						</button>
						{form.courseId ? (
							<button type="button" className="secondary-button" onClick={() => setForm(DEFAULT_COURSE_FORM)}>
								Cancel Edit
							</button>
						) : null}
					</div>
				</form>
			</section>

			<AdminListShell
				searchId="admin-course-search"
				searchValue={courseSearch}
				onSearchChange={setCourseSearch}
				searchPlaceholder="Code, title, description"
				pageSizeId="admin-course-page-size"
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.setPageSize}
				meta={paginated.meta}
				setPage={pagination.setPage}
				statusMessage={deleteFeedback.feedback.message}
				statusError={deleteFeedback.feedback.error}
			>
				<div className="admin-card-list">
					{paginated.items.map((entry) => (
						<article key={entry.course_id} className="section-card">
							<div className="section-header">
								<div>
									<p className="eyebrow">{entry.subject}</p>
									<h3>
										{entry.course_code} • {entry.title}
									</h3>
								</div>
								<span className="pill subtle">{entry.credits} credits</span>
							</div>
							<p className="section-description">{entry.description}</p>
							<div className="admin-action-row">
								<button
									type="button"
									className="secondary-button"
									onClick={() => setForm({ courseId: entry.course_id, code: entry.course_code, title: entry.title, desc: entry.description, cred: String(entry.credits) })}
								>
									Edit
								</button>
								<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteCourse(entry)}>
									Delete
								</button>
							</div>
						</article>
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminPrerequisitesView({ courses }: { courses: Course[] }) {
	const [selectedCourseId, setSelectedCourseId] = useState<number | null>(courses[0]?.course_id ?? null);
	const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
	const [candidateId, setCandidateId] = useState('');
	const [search, setSearch] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const addFeedback = useFormFeedback();
	const removeFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	useEffect(() => {
		if (selectedCourseId !== null) {
			void loadCoursePrerequisites(selectedCourseId);
		}
	}, [selectedCourseId]);

	const selectedCourse = courses.find((entry) => entry.course_id === selectedCourseId) ?? null;
	const candidates = courses.filter((entry) => entry.course_id !== selectedCourseId);
	const filteredPrerequisites = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (term === '') return prerequisites;
		return prerequisites.filter((entry) => `${entry.courseCode} ${entry.title}`.toLowerCase().includes(term));
	}, [prerequisites, search]);
	const paginated = useMemo(() => paginateItems(filteredPrerequisites, pagination.page, pagination.pageSize), [filteredPrerequisites, pagination.page, pagination.pageSize]);

	useEffect(() => {
		pagination.reset();
	}, [search, selectedCourseId]);

	async function loadCoursePrerequisites(courseId: number, options?: { preserveFeedback?: boolean }) {
		setIsLoading(true);
		if (!options?.preserveFeedback) {
			removeFeedback.reset();
		}
		try {
			const response = await listPrerequisites(courseId);
			setPrerequisites(response.map((entry) => entry.Prerequisite));
		} catch (error) {
			removeFeedback.setErrorFromUnknown(error, 'Unable to load prerequisites for that course.');
		} finally {
			setIsLoading(false);
		}
	}

	async function handleAddPrerequisite(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!selectedCourseId || candidateId === '') {
			addFeedback.setError('Select both a course and a prerequisite course.');
			return;
		}
		try {
			await createPrerequisite(selectedCourseId, Number(candidateId));
			setCandidateId('');
			addFeedback.setSuccess('Prerequisite relationship added successfully.');
			await loadCoursePrerequisites(selectedCourseId);
		} catch (error) {
			addFeedback.setErrorFromUnknown(error, 'Unable to add that prerequisite.');
		}
	}

	async function handleDeletePrerequisite(prerequisite: Prerequisite) {
		if (!selectedCourseId) return;
		try {
			await deletePrerequisite(selectedCourseId, prerequisite.courseId);
			removeFeedback.setSuccess(`${prerequisite.courseCode} removed successfully.`);
			await loadCoursePrerequisites(selectedCourseId, { preserveFeedback: true });
		} catch (error) {
			removeFeedback.setErrorFromUnknown(error, 'Unable to remove that prerequisite.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>Manage Prerequisites</h3>
				<label className="field" htmlFor="prereq-course">
					<AdminFieldLabel label="Course" required />
					<select id="prereq-course" value={selectedCourseId ?? ''} onChange={(event) => setSelectedCourseId(Number(event.target.value))}>
						{courses.map((entry) => (
							<option key={entry.course_id} value={entry.course_id}>
								{entry.course_code} • {entry.title}
							</option>
						))}
					</select>
				</label>
				<form className="stack" onSubmit={handleAddPrerequisite}>
					<label className="field" htmlFor="prereq-candidate">
						<AdminFieldLabel label="Add Prerequisite" required />
						<select id="prereq-candidate" value={candidateId} onChange={(event) => setCandidateId(event.target.value)}>
							<option value="">Select a course</option>
							{candidates.map((entry) => (
								<option key={entry.course_id} value={entry.course_id}>
									{entry.course_code} • {entry.title}
								</option>
							))}
						</select>
					</label>
					{addFeedback.feedback.message ? <StatusMessage kind="success" message={addFeedback.feedback.message} /> : null}
					{addFeedback.feedback.error ? <StatusMessage kind="error" message={addFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">
						Add Prerequisite
					</button>
				</form>
			</section>

			<AdminListShell
				searchId="admin-prerequisite-search"
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Course code or title"
				pageSizeId="admin-prerequisite-page-size"
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.setPageSize}
				meta={paginated.meta}
				setPage={pagination.setPage}
				statusMessage={removeFeedback.feedback.message}
				statusError={removeFeedback.feedback.error}
			>
				<div className="admin-card-list">
					{isLoading ? <p className="sidebar-copy">Loading prerequisite relationships...</p> : null}
					{!isLoading && paginated.items.length === 0 ? (
						<p className="sidebar-copy">No prerequisite relationships found for {selectedCourse ? selectedCourse.course_code : 'the selected course'}.</p>
					) : null}
					{paginated.items.map((entry) => (
						<article key={entry.courseId} className="section-card">
							<div className="section-header">
								<div>
									<p className="eyebrow">Prerequisite</p>
									<h3>{entry.courseCode}</h3>
								</div>
							</div>
							<p className="section-description">{entry.title}</p>
							<div className="admin-action-row">
								<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeletePrerequisite(entry)}>
									Delete Relationship
								</button>
							</div>
						</article>
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminSemestersView({ semesters, onReload }: { semesters: Semester[]; onReload: () => Promise<void> }) {
	const [search, setSearch] = useState('');
	const [form, setForm] = useState<SemesterFormState>(DEFAULT_SEMESTER_FORM);
	const createFeedback = useFormFeedback();
	const deleteFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	const filteredSemesters = useMemo(() => {
		const term = search.trim().toLowerCase();
		if (term === '') return semesters;
		return semesters.filter((entry) => `${entry.term} ${entry.year}`.toLowerCase().includes(term));
	}, [semesters, search]);
	const paginated = useMemo(() => paginateItems(filteredSemesters, pagination.page, pagination.pageSize), [filteredSemesters, pagination.page, pagination.pageSize]);

	useEffect(() => {
		pagination.reset();
	}, [search]);

	async function handleCreateSemester(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			await createSemester({ term: form.term, year: Number(form.year) });
			setForm(DEFAULT_SEMESTER_FORM);
			createFeedback.setSuccess('Semester created successfully.');
			await onReload();
		} catch (error) {
			createFeedback.setErrorFromUnknown(error, 'Unable to create that semester.');
		}
	}

	async function handleDeleteSemester(semester: Semester) {
		try {
			await deleteSemester(semester.semester_id);
			deleteFeedback.setSuccess(`${semester.term} ${semester.year} deleted successfully.`);
			await onReload();
		} catch (error) {
			deleteFeedback.setErrorFromUnknown(error, 'Unable to delete that semester.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>Create Semester</h3>
				<form className="stack" onSubmit={handleCreateSemester}>
					<label className="field" htmlFor="semester-term">
						<AdminFieldLabel label="Term" required />
						<select id="semester-term" value={form.term} onChange={(event) => setForm((current) => ({ ...current, term: event.target.value }))} required>
							<option value="">Select a term</option>
							{TERM_OPTIONS.map((term) => (
								<option key={term} value={term}>
									{term}
								</option>
							))}
						</select>
					</label>
					<FormField id="semester-year" label="Year" type="number" value={form.year} onChange={(value) => setForm((current) => ({ ...current, year: value }))} required showRequiredMarker />
					{createFeedback.feedback.message ? <StatusMessage kind="success" message={createFeedback.feedback.message} /> : null}
					{createFeedback.feedback.error ? <StatusMessage kind="error" message={createFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">
						Create Semester
					</button>
				</form>
			</section>

			<AdminListShell
				searchId="admin-semester-search"
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Term or year"
				pageSizeId="admin-semester-page-size"
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.setPageSize}
				meta={paginated.meta}
				setPage={pagination.setPage}
				statusMessage={deleteFeedback.feedback.message}
				statusError={deleteFeedback.feedback.error}
			>
				<div className="admin-card-list">
					{paginated.items.map((entry) => (
						<article key={entry.semester_id} className="section-card">
							<div className="section-header">
								<div>
									<p className="eyebrow">Semester</p>
									<h3>
										{entry.term} {entry.year}
									</h3>
								</div>
								<span className="pill subtle">ID {entry.semester_id}</span>
							</div>
							<div className="admin-action-row">
								<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteSemester(entry)}>
									Delete
								</button>
							</div>
						</article>
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminSectionsView({
	courses,
	professors,
	semesters,
	sections,
	onReload,
}: {
	courses: Course[];
	professors: User[];
	semesters: Semester[];
	sections: Section[];
	onReload: () => Promise<void>;
}) {
	const [sectionSearch, setSectionSearch] = useState('');
	const [form, setForm] = useState<SectionFormState>(DEFAULT_SECTION_FORM);
	const [flashMessages, setFlashMessages] = useState<FlashMessage[]>([]);
	const saveFeedback = useFormFeedback();
	const deleteFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	const filteredSections = useMemo(() => {
		const term = sectionSearch.trim().toLowerCase();
		if (term === '') return sections;
		return sections.filter((entry) =>
			`${entry.course.course_code} ${entry.course.title} ${entry.professor.professor_name} ${entry.semester.term} ${entry.semester.year} ${entry.days}`.toLowerCase().includes(term)
		);
	}, [sectionSearch, sections]);
	const paginated = useMemo(() => paginateItems(filteredSections, pagination.page, pagination.pageSize), [filteredSections, pagination.page, pagination.pageSize]);
	const selectedSection = sections.find((entry) => entry.section_id === form.sectionId) ?? null;
	const selectedCourse = courses.find((entry) => String(entry.course_id) === form.courseId) ?? null;
	const selectedDepartment = resolveCourseDepartment(selectedCourse);
	const availableProfessors = useMemo(() => professors.filter((entry) => selectedDepartment !== null && entry.role_details === selectedDepartment), [professors, selectedDepartment]);

	useEffect(() => {
		pagination.reset();
	}, [sectionSearch]);

	useEffect(() => {
		if (form.profId !== '' && !availableProfessors.some((entry) => String(entry.role_id) === form.profId)) {
			setForm((current) => ({ ...current, profId: '' }));
		}
	}, [availableProfessors, form.profId]);

	useEffect(() => {
		if (!saveFeedback.feedback.message && !saveFeedback.feedback.error) {
			return;
		}

		const kind = saveFeedback.feedback.error ? 'error' : 'success';
		const message = saveFeedback.feedback.error || saveFeedback.feedback.message;
		const id = Date.now() + Math.random();

		setFlashMessages((current) => [...current, { id, kind, message }]);
		saveFeedback.reset();

		const timeoutId = window.setTimeout(() => {
			setFlashMessages((current) => current.filter((entry) => entry.id !== id));
		}, 4500);

		return () => window.clearTimeout(timeoutId);
	}, [saveFeedback, saveFeedback.feedback.error, saveFeedback.feedback.message]);

	async function handleSaveSection(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!form.isAsync && form.selectedDays.length === 0) {
			saveFeedback.setError('Select at least one meeting day or mark the section as asynchronous.');
			return;
		}

		const startTime = form.isAsync ? { value: undefined, error: null } : buildTimeValue(form.startHour, form.startMinute, form.startMeridiem);
		if (startTime.error) {
			saveFeedback.setError(`Start Time: ${startTime.error}`);
			return;
		}

		const endTime = form.isAsync ? { value: undefined, error: null } : buildTimeValue(form.endHour, form.endMinute, form.endMeridiem);
		if (endTime.error) {
			saveFeedback.setError(`End Time: ${endTime.error}`);
			return;
		}

		try {
			const payload = {
				semId: Number(form.semId),
				profId: Number(form.profId),
				capacity: Number(form.capacity),
				days: form.isAsync ? 'async' : getCanonicalDayCombination(form.selectedDays),
				startTm: startTime.value,
				endTm: endTime.value,
			};
			if (form.sectionId) {
				await updateSection(form.sectionId, payload);
				saveFeedback.setSuccess(`Section ${form.sectionId} updated successfully.`);
			} else {
				await createSection(Number(form.courseId), payload);
				saveFeedback.setSuccess('Section created successfully.');
			}
			setForm(DEFAULT_SECTION_FORM);
			await onReload();
		} catch (error) {
			saveFeedback.setErrorFromUnknown(error, 'Unable to save that section.');
		}
	}

	async function handleDeleteSection(section: Section) {
		try {
			await deleteSection(section.section_id);
			deleteFeedback.setSuccess(`Section ${section.section_id} deleted successfully.`);
			await onReload();
		} catch (error) {
			deleteFeedback.setErrorFromUnknown(error, 'Unable to delete that section.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				{flashMessages.length > 0 ? (
					<div className="admin-form-flash-stack" aria-live="polite">
						{flashMessages.map((message) => (
							<div key={message.id} className="catalog-flash-banner">
								<StatusMessage kind={message.kind} message={message.message} />
							</div>
						))}
					</div>
				) : null}
				<h3>{form.sectionId ? 'Edit Section' : 'Create Section'}</h3>
				<form className="stack" onSubmit={handleSaveSection}>
					<label className="field" htmlFor="section-course">
						<AdminFieldLabel label="Course" required />
						<select
							id="section-course"
							value={form.courseId}
							onChange={(event) =>
								setForm((current) => ({
									...current,
									courseId: event.target.value,
									profId: '',
								}))
							}
							disabled={form.sectionId !== null}
							required
						>
							<option value="">Select a course</option>
							{courses.map((entry) => (
								<option key={entry.course_id} value={entry.course_id}>
									{entry.course_code} • {entry.title}
								</option>
							))}
						</select>
					</label>
					<label className="field" htmlFor="section-semester">
						<AdminFieldLabel label="Semester" required />
						<select id="section-semester" value={form.semId} onChange={(event) => setForm((current) => ({ ...current, semId: event.target.value }))} required>
							<option value="">Select a semester</option>
							{semesters.map((entry) => (
								<option key={entry.semester_id} value={entry.semester_id}>
									{entry.term} {entry.year}
								</option>
							))}
						</select>
					</label>
					<label className="field" htmlFor="section-professor">
						<AdminFieldLabel label="Professor" required />
						<select id="section-professor" value={form.profId} onChange={(event) => setForm((current) => ({ ...current, profId: event.target.value }))} required>
							<option value="">Select a professor</option>
							{availableProfessors.map((entry) => (
								<option key={entry.id} value={entry.role_id}>
									{entry.name} • {entry.role_details}
								</option>
							))}
						</select>
					</label>
					<FormField
						id="section-capacity"
						label="Capacity"
						type="number"
						value={form.capacity}
						onChange={(value) => setForm((current) => ({ ...current, capacity: value }))}
						required
						showRequiredMarker
					/>
					<div className="field">
						<AdminFieldLabel label="Meeting Days" required />
						<div className="admin-day-checkbox-grid" role="group" aria-label="Meeting Days">
							{DAY_OPTIONS.map((option) => {
								const isAsyncOption = option.value === 'async';
								const isSelected = isAsyncOption ? form.isAsync : form.selectedDays.includes(option.value);
								const isDisabled = form.isAsync && !isAsyncOption;

								return (
									<button
										key={option.value}
										id={`section-day-${option.value}`}
										type="button"
										className={`secondary-button admin-day-toggle ${isSelected ? 'selected' : 'unselected'} ${isDisabled ? 'disabled' : ''}`}
										aria-pressed={isSelected}
										aria-label={option.label}
										disabled={isDisabled}
										onClick={() =>
											setForm((current) => {
												if (isAsyncOption) {
													const nextAsync = !current.isAsync;
													return {
														...current,
														isAsync: nextAsync,
														selectedDays: nextAsync ? [] : current.selectedDays,
														startHour: nextAsync ? '' : current.startHour,
														startMinute: nextAsync ? '' : current.startMinute,
														startMeridiem: nextAsync ? 'AM' : current.startMeridiem,
														endHour: nextAsync ? '' : current.endHour,
														endMinute: nextAsync ? '' : current.endMinute,
														endMeridiem: nextAsync ? 'AM' : current.endMeridiem,
													};
												}

												return {
													...current,
													selectedDays: current.selectedDays.includes(option.value)
														? current.selectedDays.filter((day) => day !== option.value)
														: [...current.selectedDays, option.value],
												};
											})
										}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</div>
					<AdminTimeField
						idPrefix="section-start"
						label="Start Time"
						hour={form.startHour}
						minute={form.startMinute}
						meridiem={form.startMeridiem}
						onHourChange={(value) => setForm((current) => ({ ...current, startHour: value }))}
						onMinuteChange={(value) => setForm((current) => ({ ...current, startMinute: value }))}
						onMeridiemChange={(value) => setForm((current) => ({ ...current, startMeridiem: value }))}
						required
						disabled={form.isAsync}
					/>
					<AdminTimeField
						idPrefix="section-end"
						label="End Time"
						hour={form.endHour}
						minute={form.endMinute}
						meridiem={form.endMeridiem}
						onHourChange={(value) => setForm((current) => ({ ...current, endHour: value }))}
						onMinuteChange={(value) => setForm((current) => ({ ...current, endMinute: value }))}
						onMeridiemChange={(value) => setForm((current) => ({ ...current, endMeridiem: value }))}
						required
						disabled={form.isAsync}
					/>
					<div className="admin-action-row">
						<button type="submit" className="primary-button">
							{form.sectionId ? 'Save Section' : 'Create Section'}
						</button>
						{form.sectionId ? (
							<button type="button" className="secondary-button" onClick={() => setForm(DEFAULT_SECTION_FORM)}>
								Cancel Edit
							</button>
						) : null}
					</div>
				</form>
			</section>

			<AdminListShell
				searchId="admin-section-search"
				searchValue={sectionSearch}
				onSearchChange={setSectionSearch}
				searchPlaceholder="Course, professor, term, year"
				pageSizeId="admin-section-page-size"
				pageSize={pagination.pageSize}
				onPageSizeChange={pagination.setPageSize}
				meta={paginated.meta}
				setPage={pagination.setPage}
				statusMessage={deleteFeedback.feedback.message}
				statusError={deleteFeedback.feedback.error}
			>
				<div className="admin-card-list">
					{paginated.items.map((entry) => (
						<article key={entry.section_id} className="section-card">
							<div className="section-header">
								<div>
									<p className="eyebrow">Section {entry.section_id}</p>
									<h3>
										{entry.course.course_code} • {entry.course.title}
									</h3>
								</div>
								<span className="pill subtle">
									{entry.semester.term} {entry.semester.year}
								</span>
							</div>
							<div className="catalog-meta-grid">
								<div className="info-card">
									<span className="info-label">Professor</span>
									<strong>{entry.professor.professor_name}</strong>
								</div>
								<div className="info-card">
									<span className="info-label">Meeting</span>
									<strong>{getSectionMeetingLabel(entry.days)}</strong>
								</div>
								<div className="info-card">
									<span className="info-label">Time</span>
									<strong>{formatTimeRange(entry.start_time, entry.end_time)}</strong>
								</div>
								<div className="info-card">
									<span className="info-label">Seats</span>
									<strong>
										{entry.seats_available}/{entry.capacity}
									</strong>
								</div>
							</div>
							<div className="admin-action-row">
								<button
									type="button"
									className="secondary-button"
									onClick={() =>
										setForm({
											sectionId: entry.section_id,
											courseId: String(entry.course.course_id),
											semId: String(entry.semester.semester_id),
											profId: String(entry.professor.professor_id),
											capacity: String(entry.capacity),
											selectedDays: parseDayCombination(entry.days),
											isAsync: entry.days === 'async',
											...(() => {
												const start = parseTimeParts(entry.start_time);
												const end = parseTimeParts(entry.end_time);
												return {
													startHour: start.hour,
													startMinute: start.minute,
													startMeridiem: start.meridiem,
													endHour: end.hour,
													endMinute: end.minute,
													endMeridiem: end.meridiem,
												};
											})(),
										})
									}
								>
									Edit
								</button>
								<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteSection(entry)}>
									Delete
								</button>
							</div>
						</article>
					))}
				</div>
				{selectedSection ? <p className="sidebar-copy">Editing section {selectedSection.section_id}. The course selection remains locked while editing the existing section.</p> : null}
			</AdminListShell>
		</section>
	);
}

function UserCard({ user, onReload, onUserSaved, onUserDeleted }: { user: User; onReload: () => Promise<void>; onUserSaved: (user: User) => void; onUserDeleted: (userId: number) => void }) {
	const [type, setType] = useState<UserRole>(user.role);
	const [detail, setDetail] = useState(user.role_details);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const feedback = useFormFeedback();

	useEffect(() => {
		setType(user.role);
		setDetail(user.role_details);
	}, [user.id, user.role, user.role_details]);

	async function handleRoleSave() {
		try {
			const updatedUser = unwrapUser(await updateUserRole(user.id, { type, detail }));
			onUserSaved(updatedUser);
			feedback.setSuccess(`Updated ${user.name}'s role successfully.`);
			void onReload();
		} catch (error) {
			feedback.setErrorFromUnknown(error, 'Unable to update that user role.');
		}
	}

	async function handleDelete() {
		feedback.reset();
		if (deleteConfirmation.trim().toLowerCase() !== 'confirm') {
			feedback.setError('Type "confirm" to delete this user.');
			return;
		}

		setIsDeleting(true);

		try {
			await deleteUser(user.id);
			onUserDeleted(user.id);
			void onReload();
		} catch (error) {
			feedback.setErrorFromUnknown(error, 'Unable to delete that user.');
			setIsDeleting(false);
		}
	}

	function openDeleteDialog() {
		feedback.reset();
		setDeleteConfirmation('');
		setIsDeleting(false);
		setIsDeleteDialogOpen(true);
	}

	function closeDeleteDialog() {
		if (isDeleting) {
			return;
		}

		feedback.reset();
		setDeleteConfirmation('');
		setIsDeleteDialogOpen(false);
	}

	return (
		<>
			<article className="section-card admin-user-card">
				<div className="admin-user-card-header">
					<h3>{user.name}</h3>
					<span className="pill subtle">ID {user.id}</span>
				</div>
				<div className="admin-user-card-summary">
					<span className="eyebrow">{user.role}</span>
					<span>{user.role_details}</span>
					<span>{user.email}</span>
				</div>
				<div className="admin-inline-grid admin-user-card-controls">
					<label className="field" htmlFor={`user-role-${user.id}`}>
						<AdminFieldLabel label="Role" required />
						<select id={`user-role-${user.id}`} value={type} onChange={(event) => setType(event.target.value as UserRole)}>
							<option value="STUDENT">Student</option>
							<option value="PROFESSOR">Professor</option>
							<option value="ADMIN">Admin</option>
						</select>
					</label>
					<FormField id={`user-detail-${user.id}`} label={ROLE_DETAIL_LABEL[type]} value={detail} onChange={setDetail} required showRequiredMarker />
				</div>
				{feedback.feedback.message ? <StatusMessage kind="success" message={feedback.feedback.message} /> : null}
				{feedback.feedback.error && !isDeleteDialogOpen ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}
				<div className="admin-action-row admin-user-card-actions">
					<button type="button" className="secondary-button" onClick={() => void handleRoleSave()}>
						Save Role
					</button>
					<button type="button" className="secondary-button admin-danger-button" onClick={openDeleteDialog}>
						Delete User
					</button>
				</div>
			</article>

			{isDeleteDialogOpen ? (
				<div className="dialog-backdrop" role="presentation" onClick={closeDeleteDialog}>
					<section className="dialog-card" role="dialog" aria-modal="true" aria-labelledby={`delete-user-title-${user.id}`} onClick={(event) => event.stopPropagation()}>
						<div className="panel-header">
							<div>
								<p className="eyebrow">Delete User</p>
								<h3 id={`delete-user-title-${user.id}`}>Confirm User Removal</h3>
							</div>
						</div>
						<div className="stack">
							<p>
								Delete <strong>{user.name}</strong> from the system.
							</p>
							<p className="sidebar-meta">Type "confirm" to continue. This dialog stays open until the delete request finishes.</p>
							<FormField id={`delete-user-confirmation-${user.id}`} label='Type "confirm"' value={deleteConfirmation} onChange={setDeleteConfirmation} autoComplete="off" />
							{feedback.feedback.error ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}
						</div>
						<div className="dialog-actions">
							<button type="button" className="secondary-button" onClick={closeDeleteDialog} disabled={isDeleting}>
								Cancel
							</button>
							<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDelete()} disabled={isDeleting}>
								{isDeleting ? 'Deleting...' : 'Delete User'}
							</button>
						</div>
					</section>
				</div>
			) : null}
		</>
	);
}
