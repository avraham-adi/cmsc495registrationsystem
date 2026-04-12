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
import type {
	AdminUserCreatePayload,
	Course,
	Meta,
	Prerequisite,
	Section,
	Semester,
	User,
	UserRole,
} from '../types/api';

type AdminArea = 'home' | 'tools';
type AdminHomeView = 'overview' | 'profile' | 'password';
type AdminToolView = 'users' | 'courses' | 'prerequisites' | 'semesters' | 'sections';

type AdminDataState = {
	users: User[],
	professors: User[],
	courses: Course[],
	semesters: Semester[],
	sections: Section[],
};

type UserFormState = {
	name: string,
	email: string,
	type: UserRole,
	detail: string,
};

type CourseFormState = {
	courseId: number | null,
	code: string,
	title: string,
	desc: string,
	cred: string,
};

type SemesterFormState = {
	term: string,
	year: string,
};

type SectionFormState = {
	sectionId: number | null,
	courseId: string,
	semId: string,
	profId: string,
	capacity: string,
	days: string,
	startTm: string,
	endTm: string,
};

type PaginationState = {
	page: number,
	pageSize: number,
};

type PaginatedResult<T> = {
	items: T[],
	meta: Meta,
};

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

const DEFAULT_SECTION_FORM: SectionFormState = {
	sectionId: null,
	courseId: '',
	semId: '',
	profId: '',
	capacity: '25',
	days: '',
	startTm: '',
	endTm: '',
};

const ROLE_DETAIL_LABEL: Record<UserRole, string> = {
	ADMIN: 'Access Level',
	PROFESSOR: 'Department',
	STUDENT: 'Major',
};

function toTimeValue(value: string | null) {
	return value ? value.slice(0, 8) : '';
}

// Converts empty optional text inputs into undefined values for API payloads.
function normalizeOptional(value: string) {
	const trimmed = value.trim();
	return trimmed === '' ? undefined : trimmed;
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
async function fetchAllPaginated<T, TResponse extends { Meta: Meta }>(
	loadPage: (page: number) => Promise<TResponse>,
	mapItems: (response: TResponse) => T[]
) {
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
			const [users, professors, courses, semestersResponse, sections] = await Promise.all([
				fetchAllUsers(),
				fetchAllUsers('PROFESSOR'),
				fetchAllCourses(),
				listSemesters(),
				fetchAllSections(),
			]);

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

	// Switches the Admin Home subview while keeping query params normalized.
	function setAdminHomeView(view: AdminHomeView) {
		setSearchParams(buildSingleParamState('view', view, 'overview'));
	}

	// Switches the Admin Tools subview while keeping query params normalized.
	function setAdminToolView(view: AdminToolView) {
		setSearchParams(buildSingleParamState('tool', view, 'users'));
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
						<button type="button" className={`dashboard-section-button ${activeHomeView === 'overview' ? 'active' : ''}`} onClick={() => setAdminHomeView('overview')} disabled={requiresPasswordChange}>
							Overview
						</button>
						<button type="button" className={`dashboard-section-button ${activeHomeView === 'profile' ? 'active' : ''}`} onClick={() => setAdminHomeView('profile')} disabled={requiresPasswordChange}>
							Profile
						</button>
						<button type="button" className={`dashboard-section-button ${activeHomeView === 'password' ? 'active' : ''}`} onClick={() => setAdminHomeView('password')}>
							Password
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
							<FormField id="admin-confirm-password" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required />
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

				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'users' ? <AdminUsersView users={data.users} onReload={refreshAdminData} /> : null}
				{!isLoading && !loadError && activeArea === 'tools' && activeToolView === 'courses' ? <AdminCoursesView courses={data.courses} onReload={refreshAdminData} /> : null}
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
				<p className="sidebar-copy">Use the Admin Home to manage your profile and authentication. Open Admin Tools to manage users, courses, prerequisites, semesters, and section offerings.</p>
			</div>
			<div className="subpanel stack">
				<h3>Current Inventory</h3>
				<p className="sidebar-copy">The current environment includes {data.users.length} users, {data.courses.length} courses, {data.semesters.length} semesters, and {data.sections.length} sections.</p>
			</div>
		</section>
	);
}

function AdminUsersView({ users, onReload }: { users: User[], onReload: () => Promise<void> }) {
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
			await createUser(payload);
			setForm(DEFAULT_USER_FORM);
			createFeedback.setSuccess('User created successfully.');
			await onReload();
		} catch (error) {
			createFeedback.setErrorFromUnknown(error, 'Unable to create that user.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>Create User</h3>
				<form className="stack" onSubmit={handleCreateUser}>
					<FormField id="admin-user-name" label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
					<FormField id="admin-user-email" label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} required />
					<label className="field" htmlFor="admin-user-type">
						<span>Role</span>
						<select id="admin-user-type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as UserRole, detail: '' }))}>
							<option value="STUDENT">Student</option>
							<option value="PROFESSOR">Professor</option>
							<option value="ADMIN">Admin</option>
						</select>
					</label>
					<FormField id="admin-user-detail" label={ROLE_DETAIL_LABEL[form.type]} value={form.detail} onChange={(value) => setForm((current) => ({ ...current, detail: value }))} required />
					{createFeedback.feedback.message ? <StatusMessage kind="success" message={createFeedback.feedback.message} /> : null}
					{createFeedback.feedback.error ? <StatusMessage kind="error" message={createFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">Create User</button>
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
					{paginated.items.map((entry) => <UserCard key={entry.id} user={entry} onReload={onReload} />)}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminCoursesView({ courses, onReload }: { courses: Course[], onReload: () => Promise<void> }) {
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
				await updateCourse(form.courseId, payload);
				saveFeedback.setSuccess(`Updated ${selectedCourse?.course_code ?? 'course'} successfully.`);
			} else {
				await createCourse(payload);
				saveFeedback.setSuccess('Course created successfully.');
			}
			setForm(DEFAULT_COURSE_FORM);
			await onReload();
		} catch (error) {
			saveFeedback.setErrorFromUnknown(error, 'Unable to save that course.');
		}
	}

	async function handleDeleteCourse(course: Course) {
		try {
			await deleteCourse(course.course_id);
			deleteFeedback.setSuccess(`${course.course_code} deleted successfully.`);
			await onReload();
		} catch (error) {
			deleteFeedback.setErrorFromUnknown(error, 'Unable to delete that course.');
		}
	}

	return (
		<section className="admin-tool-layout">
			<section className="subpanel stack admin-form-panel">
				<h3>{form.courseId ? 'Edit Course' : 'Create Course'}</h3>
				<form className="stack" onSubmit={handleSaveCourse}>
					<FormField id="course-code" label="Course Code" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value.toUpperCase() }))} required />
					<FormField id="course-title" label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
					<label className="field" htmlFor="course-desc">
						<span>Description</span>
						<textarea id="course-desc" className="admin-textarea" value={form.desc} onChange={(event) => setForm((current) => ({ ...current, desc: event.target.value }))} required />
					</label>
					<FormField id="course-credits" label="Credits" type="number" value={form.cred} onChange={(value) => setForm((current) => ({ ...current, cred: value }))} required />
					{saveFeedback.feedback.message ? <StatusMessage kind="success" message={saveFeedback.feedback.message} /> : null}
					{saveFeedback.feedback.error ? <StatusMessage kind="error" message={saveFeedback.feedback.error} /> : null}
					<div className="admin-action-row">
						<button type="submit" className="primary-button">{form.courseId ? 'Save Course' : 'Create Course'}</button>
						{form.courseId ? <button type="button" className="secondary-button" onClick={() => setForm(DEFAULT_COURSE_FORM)}>Cancel Edit</button> : null}
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
											<h3>{entry.course_code} • {entry.title}</h3>
										</div>
										<span className="pill subtle">{entry.credits} credits</span>
									</div>
									<p className="section-description">{entry.description}</p>
									<div className="admin-action-row">
										<button type="button" className="secondary-button" onClick={() => setForm({ courseId: entry.course_id, code: entry.course_code, title: entry.title, desc: entry.description, cred: String(entry.credits) })}>Edit</button>
										<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteCourse(entry)}>Delete</button>
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
					<span>Course</span>
					<select id="prereq-course" value={selectedCourseId ?? ''} onChange={(event) => setSelectedCourseId(Number(event.target.value))}>
						{courses.map((entry) => <option key={entry.course_id} value={entry.course_id}>{entry.course_code} • {entry.title}</option>)}
					</select>
				</label>
				<form className="stack" onSubmit={handleAddPrerequisite}>
					<label className="field" htmlFor="prereq-candidate">
						<span>Add Prerequisite</span>
						<select id="prereq-candidate" value={candidateId} onChange={(event) => setCandidateId(event.target.value)}>
							<option value="">Select a course</option>
							{candidates.map((entry) => <option key={entry.course_id} value={entry.course_id}>{entry.course_code} • {entry.title}</option>)}
						</select>
					</label>
					{addFeedback.feedback.message ? <StatusMessage kind="success" message={addFeedback.feedback.message} /> : null}
					{addFeedback.feedback.error ? <StatusMessage kind="error" message={addFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">Add Prerequisite</button>
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
					{!isLoading && paginated.items.length === 0 ? <p className="sidebar-copy">No prerequisite relationships found for {selectedCourse ? selectedCourse.course_code : 'the selected course'}.</p> : null}
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
										<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeletePrerequisite(entry)}>Delete Relationship</button>
									</div>
								</article>
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminSemestersView({ semesters, onReload }: { semesters: Semester[], onReload: () => Promise<void> }) {
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
					<FormField id="semester-term" label="Term" value={form.term} onChange={(value) => setForm((current) => ({ ...current, term: value }))} required />
					<FormField id="semester-year" label="Year" type="number" value={form.year} onChange={(value) => setForm((current) => ({ ...current, year: value }))} required />
					{createFeedback.feedback.message ? <StatusMessage kind="success" message={createFeedback.feedback.message} /> : null}
					{createFeedback.feedback.error ? <StatusMessage kind="error" message={createFeedback.feedback.error} /> : null}
					<button type="submit" className="primary-button">Create Semester</button>
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
											<h3>{entry.term} {entry.year}</h3>
										</div>
										<span className="pill subtle">ID {entry.semester_id}</span>
									</div>
									<div className="admin-action-row">
										<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteSemester(entry)}>Delete</button>
									</div>
								</article>
					))}
				</div>
			</AdminListShell>
		</section>
	);
}

function AdminSectionsView({ courses, professors, semesters, sections, onReload }: { courses: Course[], professors: User[], semesters: Semester[], sections: Section[], onReload: () => Promise<void> }) {
	const [sectionSearch, setSectionSearch] = useState('');
	const [form, setForm] = useState<SectionFormState>(DEFAULT_SECTION_FORM);
	const saveFeedback = useFormFeedback();
	const deleteFeedback = useFormFeedback();
	const pagination = useLocalPagination();

	const filteredSections = useMemo(() => {
		const term = sectionSearch.trim().toLowerCase();
		if (term === '') return sections;
		return sections.filter((entry) => `${entry.course.course_code} ${entry.course.title} ${entry.professor.professor_name} ${entry.semester.term} ${entry.semester.year} ${entry.days}`.toLowerCase().includes(term));
	}, [sectionSearch, sections]);
	const paginated = useMemo(() => paginateItems(filteredSections, pagination.page, pagination.pageSize), [filteredSections, pagination.page, pagination.pageSize]);
	const selectedSection = sections.find((entry) => entry.section_id === form.sectionId) ?? null;

	useEffect(() => {
		pagination.reset();
	}, [sectionSearch]);

	async function handleSaveSection(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try {
			const payload = {
				semId: Number(form.semId),
				profId: Number(form.profId),
				capacity: Number(form.capacity),
				days: normalizeOptional(form.days),
				startTm: normalizeOptional(form.startTm),
				endTm: normalizeOptional(form.endTm),
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
				<h3>{form.sectionId ? 'Edit Section' : 'Create Section'}</h3>
				<form className="stack" onSubmit={handleSaveSection}>
					<label className="field" htmlFor="section-course">
						<span>Course</span>
						<select id="section-course" value={form.courseId} onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))} disabled={form.sectionId !== null}>
							<option value="">Select a course</option>
							{courses.map((entry) => <option key={entry.course_id} value={entry.course_id}>{entry.course_code} • {entry.title}</option>)}
						</select>
					</label>
					<label className="field" htmlFor="section-semester">
						<span>Semester</span>
						<select id="section-semester" value={form.semId} onChange={(event) => setForm((current) => ({ ...current, semId: event.target.value }))}>
							<option value="">Select a semester</option>
							{semesters.map((entry) => <option key={entry.semester_id} value={entry.semester_id}>{entry.term} {entry.year}</option>)}
						</select>
					</label>
					<label className="field" htmlFor="section-professor">
						<span>Professor</span>
						<select id="section-professor" value={form.profId} onChange={(event) => setForm((current) => ({ ...current, profId: event.target.value }))}>
							<option value="">Select a professor</option>
							{professors.map((entry) => <option key={entry.id} value={entry.role_id}>{entry.name} • {entry.role_details}</option>)}
						</select>
					</label>
					<FormField id="section-capacity" label="Capacity" type="number" value={form.capacity} onChange={(value) => setForm((current) => ({ ...current, capacity: value }))} required />
					<FormField id="section-days" label="Meeting Days" value={form.days} onChange={(value) => setForm((current) => ({ ...current, days: value.toUpperCase() }))} placeholder="MWF or TR" />
					<FormField id="section-start" label="Start Time" value={form.startTm} onChange={(value) => setForm((current) => ({ ...current, startTm: value }))} placeholder="09:00:00" />
					<FormField id="section-end" label="End Time" value={form.endTm} onChange={(value) => setForm((current) => ({ ...current, endTm: value }))} placeholder="10:15:00" />
					{saveFeedback.feedback.message ? <StatusMessage kind="success" message={saveFeedback.feedback.message} /> : null}
					{saveFeedback.feedback.error ? <StatusMessage kind="error" message={saveFeedback.feedback.error} /> : null}
					<div className="admin-action-row">
						<button type="submit" className="primary-button">{form.sectionId ? 'Save Section' : 'Create Section'}</button>
						{form.sectionId ? <button type="button" className="secondary-button" onClick={() => setForm(DEFAULT_SECTION_FORM)}>Cancel Edit</button> : null}
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
											<h3>{entry.course.course_code} • {entry.course.title}</h3>
										</div>
										<span className="pill subtle">{entry.semester.term} {entry.semester.year}</span>
									</div>
									<div className="catalog-meta-grid">
										<div className="info-card">
											<span className="info-label">Professor</span>
											<strong>{entry.professor.professor_name}</strong>
										</div>
										<div className="info-card">
											<span className="info-label">Meeting</span>
											<strong>{entry.days === 'async' ? 'Asynchronous' : entry.days}</strong>
										</div>
										<div className="info-card">
											<span className="info-label">Time</span>
											<strong>{entry.start_time && entry.end_time ? `${entry.start_time.slice(0, 5)}-${entry.end_time.slice(0, 5)}` : 'Unscheduled'}</strong>
										</div>
										<div className="info-card">
											<span className="info-label">Seats</span>
											<strong>{entry.seats_available}/{entry.capacity}</strong>
										</div>
									</div>
									<div className="admin-action-row">
										<button type="button" className="secondary-button" onClick={() => setForm({ sectionId: entry.section_id, courseId: String(entry.course.course_id), semId: String(entry.semester.semester_id), profId: String(entry.professor.professor_id), capacity: String(entry.capacity), days: entry.days === 'async' ? '' : entry.days, startTm: toTimeValue(entry.start_time), endTm: toTimeValue(entry.end_time) })}>Edit</button>
										<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDeleteSection(entry)}>Delete</button>
									</div>
								</article>
					))}
				</div>
				{selectedSection ? <p className="sidebar-copy">Editing section {selectedSection.section_id}. The course selection remains locked while editing the existing section.</p> : null}
			</AdminListShell>
		</section>
	);
}

function UserCard({ user, onReload }: { user: User, onReload: () => Promise<void> }) {
	const [type, setType] = useState<UserRole>(user.role);
	const [detail, setDetail] = useState(user.role_details);
	const feedback = useFormFeedback();

	useEffect(() => {
		setType(user.role);
		setDetail(user.role_details);
	}, [user.id, user.role, user.role_details]);

	async function handleRoleSave() {
		try {
			await updateUserRole(user.id, { type, detail });
			feedback.setSuccess(`Updated ${user.name}'s role successfully.`);
			await onReload();
		} catch (error) {
			feedback.setErrorFromUnknown(error, 'Unable to update that user role.');
		}
	}

	async function handleDelete() {
		try {
			await deleteUser(user.id);
			await onReload();
		} catch (error) {
			feedback.setErrorFromUnknown(error, 'Unable to delete that user.');
		}
	}

	return (
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
					<span>Role</span>
					<select id={`user-role-${user.id}`} value={type} onChange={(event) => setType(event.target.value as UserRole)}>
						<option value="STUDENT">Student</option>
						<option value="PROFESSOR">Professor</option>
						<option value="ADMIN">Admin</option>
					</select>
				</label>
				<FormField id={`user-detail-${user.id}`} label={ROLE_DETAIL_LABEL[type]} value={detail} onChange={setDetail} required />
			</div>
			{feedback.feedback.message ? <StatusMessage kind="success" message={feedback.feedback.message} /> : null}
			{feedback.feedback.error ? <StatusMessage kind="error" message={feedback.feedback.error} /> : null}
			<div className="admin-action-row admin-user-card-actions">
				<button type="button" className="secondary-button" onClick={() => void handleRoleSave()}>Save Role</button>
				<button type="button" className="secondary-button admin-danger-button" onClick={() => void handleDelete()}>Delete User</button>
			</div>
		</article>
	);
}
