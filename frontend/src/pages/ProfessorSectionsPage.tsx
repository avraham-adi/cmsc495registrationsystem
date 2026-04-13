/*
Adi Avraham
CMSC495 Group Golf Capstone Project
ProfessorSectionsPage.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders the professor home, assigned sections, access-code tools, and embedded account views.
*/

import { useEffect, useMemo, useState, type FormEvent, type SubmitEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateSectionAccessCodes, listProfessorSections, listSectionAccessCodes, mapSectionList, revokeSectionAccessCode, sortSectionsByCourse } from '../api/professor';
import { ProfessorOnly } from '../components/AppShell';
import { FormField } from '../components/FormField';
import { StatusMessage } from '../components/StatusMessage';
import { useAuth } from '../context/AuthContext';
import { buildSingleParamState, normalizeEnumParam } from '../lib/queryParams';
import { getErrorMessage, useFormFeedback } from '../lib/useFormFeedback';
import type { Section, SectionAccessCodeMap } from '../types/api';

const TERM_RANK: Record<string, number> = {
	Spring: 1,
	Summer: 2,
	Fall: 3,
	Winter: 4,
};

type ProfessorView = 'sections' | 'profile' | 'password';

type SectionCodeEntry = {
	key: string,
	value: string,
	used: boolean,
};

type SectionCardState = {
	quantity: string,
	message: string,
	error: string,
	isGenerating: boolean,
	revokingCode: string | null,
};

type SectionGroup = {
	key: string,
	semesterLabel: string,
	subjectLabel: string,
	sections: Section[],
};

const DEFAULT_CARD_STATE: SectionCardState = {
	quantity: '3',
	message: '',
	error: '',
	isGenerating: false,
	revokingCode: null,
};

// Converts a raw section access-code map into sorted code entries for the UI.
function parseAccessCodes(source: SectionAccessCodeMap) {
	return Object.keys(source)
		.filter((key) => /^code\d+$/.test(key))
		.sort((left, right) => Number(left.replace('code', '')) - Number(right.replace('code', '')))
		.map((key) => ({
			key,
			value: String(source[key]),
			used: Boolean(source[`${key}_used`]),
		}));
}

// Formats a section meeting pattern into a short professor-facing label.
function formatMeeting(section: Section) {
	if (section.days === 'async') {
		return 'Asynchronous';
	}

	if (!section.start_time || !section.end_time) {
		return section.days;
	}

	return `${section.days} ${section.start_time.slice(0, 5)}-${section.end_time.slice(0, 5)}`;
}

// Finds the current semester from a professor's assigned sections.
function getCurrentSemesterId(sections: Section[]): number | null {
	if (sections.length === 0) {
		return null;
	}

	let current = sections[0];
	for (const section of sections) {
		if (section.semester.year !== current.semester.year) {
			if (section.semester.year > current.semester.year) {
				current = section;
			}
		} else if (section.semester.year === current.semester.year) {
			const currentTermRank = TERM_RANK[current.semester.term] ?? 0;
			const sectionTermRank = TERM_RANK[section.semester.term] ?? 0;
			if (sectionTermRank > currentTermRank) {
				current = section;
			}
		}
	}

	return current.semester.semester_id;
}

type SectionGroupSection = {
	currentSectionGroups: SectionGroup[],
	previousSectionGroups: SectionGroup[],
	currentSectionCount: number,
};

export function ProfessorSectionsPage() {
	const navigate = useNavigate();
	const { user, requiresPasswordChange, updateProfileAction, changePasswordAction, refreshUser } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [sections, setSections] = useState<Section[]>([]);
	const [expandedPreviousSemesters, setExpandedPreviousSemesters] = useState(false);
	const [codesBySection, setCodesBySection] = useState<Record<number, SectionCodeEntry[]>>({});
	const [cardState, setCardState] = useState<Record<number, SectionCardState>>({});
	const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const profileFeedback = useFormFeedback();
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const passwordFeedback = useFormFeedback();
	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const activeView = normalizeEnumParam(searchParams.get('view'), ['sections', 'profile', 'password'] as const, 'sections');

	const sectionGrouping = useMemo<SectionGroupSection>(() => {
		const sorted = sortSectionsByCourse(sections).sort((left, right) => {
			if (left.semester.year !== right.semester.year) {
				return right.semester.year - left.semester.year;
			}

			const leftTerm = TERM_RANK[left.semester.term] ?? 0;
			const rightTerm = TERM_RANK[right.semester.term] ?? 0;
			if (leftTerm !== rightTerm) {
				return rightTerm - leftTerm;
			}

			const subjectCompare = (left.course.subject ?? '').localeCompare(right.course.subject ?? '');
			if (subjectCompare !== 0) {
				return subjectCompare;
			}

			const courseCompare = left.course.course_code.localeCompare(right.course.course_code);
			if (courseCompare !== 0) {
				return courseCompare;
			}

			return left.section_id - right.section_id;
		});

		const currentSemesterId = getCurrentSemesterId(sections);
		const groupMap: Record<string, SectionGroup> = {};
		let currentSectionCount = 0;

		for (const section of sorted) {
			const semesterLabel = `${section.semester.term} ${section.semester.year}`;
			const subjectLabel = section.course.subject || section.course.course_code.replace(/[0-9].*$/, '');
			const key = `${semesterLabel}-${subjectLabel}`;

			if (!groupMap[key]) {
				groupMap[key] = {
					key,
					semesterLabel,
					subjectLabel,
					sections: [],
				};
			}

			groupMap[key].sections.push(section);

			if (section.semester.semester_id === currentSemesterId) {
				currentSectionCount += 1;
			}
		}

		const groups = Object.values(groupMap);
		const currentSectionGroups: SectionGroup[] = [];
		const previousSectionGroups: SectionGroup[] = [];

		for (const group of groups) {
			const isCurrentSemester = group.sections.some((s) => s.semester.semester_id === currentSemesterId);
			if (isCurrentSemester) {
				currentSectionGroups.push(group);
			} else {
				previousSectionGroups.push(group);
			}
		}

		return {
			currentSectionGroups,
			previousSectionGroups,
			currentSectionCount,
		};
	}, [sections]);

	const selectedSection = selectedSectionId === null ? null : (sections.find((entry) => entry.section_id === selectedSectionId) ?? null);
	const selectedCodes = selectedSectionId === null ? [] : (codesBySection[selectedSectionId] ?? []);
	const selectedState = selectedSectionId === null ? DEFAULT_CARD_STATE : (cardState[selectedSectionId] ?? DEFAULT_CARD_STATE);

	useEffect(() => {
		void loadProfessorSections();
	}, [user?.role_id]);

	useEffect(() => {
		setName(user?.name ?? '');
		setEmail(user?.email ?? '');
	}, [user?.email, user?.name]);

	function setProfessorView(view: ProfessorView) {
		setSearchParams(buildSingleParamState('view', view, 'sections'));
	}

	// Loads the professor's sections and the current access-code inventory for each section.
	async function loadProfessorSections() {
		if (!user?.role_id) {
			return;
		}

		setIsLoading(true);
		setLoadError('');

		try {
			const sectionResponse = await listProfessorSections(user.role_id);
			const sectionList = mapSectionList(sectionResponse);
			setSections(sectionList);

			const codeEntries = await Promise.all(
				sectionList.map(async (section) => {
					const codes = await listSectionAccessCodes(section.section_id);
					return [section.section_id, parseAccessCodes(codes)] as const;
				})
			);

			setCodesBySection(Object.fromEntries(codeEntries));
			setCardState(Object.fromEntries(sectionList.map((section) => [section.section_id, DEFAULT_CARD_STATE])));
		} catch (error) {
			setLoadError(getErrorMessage(error, 'Unable to load professor sections right now.'));
		} finally {
			setIsLoading(false);
		}
	}

	// Refreshes the access-code list for a single section after a mutation.
	async function refreshSectionCodes(sectionId: number) {
		const codes = await listSectionAccessCodes(sectionId);
		setCodesBySection((current) => ({
			...current,
			[sectionId]: parseAccessCodes(codes),
		}));
	}

	// Applies a partial state update for one professor section card.
	function updateCardState(sectionId: number, partial: Partial<SectionCardState>) {
		setCardState((current) => ({
			...current,
			[sectionId]: {
				...(current[sectionId] ?? DEFAULT_CARD_STATE),
				...partial,
			},
		}));
	}

	// Generates additional access codes for the selected section.
	async function handleGenerate(sectionId: number, event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const state = cardState[sectionId] ?? DEFAULT_CARD_STATE;

		updateCardState(sectionId, {
			isGenerating: true,
			message: '',
			error: '',
		});

		try {
			await generateSectionAccessCodes(sectionId, Number(state.quantity));
			await refreshSectionCodes(sectionId);
			updateCardState(sectionId, {
				isGenerating: false,
				message: `${Number(state.quantity)} access code${Number(state.quantity) === 1 ? '' : 's'} generated.`,
				error: '',
			});
		} catch (error) {
			updateCardState(sectionId, {
				isGenerating: false,
				message: '',
				error: getErrorMessage(error, 'Unable to generate access codes for that section.'),
			});
		}
	}

	// Revokes one access code from the selected section.
	async function handleRevoke(sectionId: number, code: string) {
		updateCardState(sectionId, {
			revokingCode: code,
			message: '',
			error: '',
		});

		try {
			await revokeSectionAccessCode(sectionId, code);
			await refreshSectionCodes(sectionId);
			updateCardState(sectionId, {
				revokingCode: null,
				message: 'Access code revoked.',
				error: '',
			});
		} catch (error) {
			updateCardState(sectionId, {
				revokingCode: null,
				message: '',
				error: getErrorMessage(error, 'Unable to revoke that access code.'),
			});
		}
	}

	// Saves the professor's editable profile information.
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

	// Updates the professor's password and refreshes the app session after success.
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
			setProfessorView('sections');

			if (wasFirstLogin) {
				const firstLoginDestination = refreshedUser.role === 'ADMIN' ? '/console/admin' : '/';

				if (window.location.pathname === firstLoginDestination) {
					window.location.reload();
				} else {
					window.location.assign(firstLoginDestination);
				}
				return;
			}

			navigate('/', { replace: true });
			return;
		} catch (error) {
			passwordFeedback.setErrorFromUnknown(error, 'Unable to change password right now.');
		} finally {
			setIsSavingPassword(false);
		}
	}

	return (
		<ProfessorOnly>
			<section className="panel stack dashboard-panel">
				<div className="panel-header">
					<div>
						<p className="eyebrow">Professor Workflow</p>
						<h2>Professor Home</h2>
					</div>
				</div>

				<div className="dashboard-section-nav" role="tablist" aria-label="Professor sections">
					<button
						type="button"
						className={`dashboard-section-button ${activeView === 'sections' ? 'active' : ''}`}
						onClick={() => setProfessorView('sections')}
						disabled={requiresPasswordChange}
					>
						Sections
					</button>
					<button
						type="button"
						className={`dashboard-section-button ${activeView === 'profile' ? 'active' : ''}`}
						onClick={() => setProfessorView('profile')}
						disabled={requiresPasswordChange}
					>
						Profile
					</button>
				</div>

				<div className="info-grid dashboard-info-grid">
					<div className="info-card">
						<span className="info-label">Professor</span>
						<strong>{user?.name ?? 'Unknown professor'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Department</span>
						<strong>{user?.role_details ?? 'Unassigned'}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Assigned Sections</span>
						<strong>{sectionGrouping.currentSectionCount}</strong>
					</div>
					<div className="info-card">
						<span className="info-label">Subject Groups</span>
						<strong>{sectionGrouping.currentSectionGroups.length}</strong>
					</div>
				</div>

				{activeView === 'sections' ? (
					<section className="subpanel stack admin-list-panel professor-sections-panel">
						<div className="panel-header">
							<div>
								<p className="eyebrow">Teaching Assignments</p>
								<h3>Sections and Access Codes</h3>
							</div>
						</div>

						{isLoading ? <p className="sidebar-copy">Loading teaching assignments...</p> : null}
						{loadError ? <StatusMessage kind="error" message={loadError} /> : null}

						{!isLoading && !loadError ? (
							sectionGrouping.currentSectionGroups.length === 0 && sectionGrouping.previousSectionGroups.length === 0 ? (
								<section className="subpanel stack">
									<h3>No Assigned Sections</h3>
									<p className="sidebar-copy">There are currently no sections assigned to this professor account.</p>
								</section>
							) : (
								<div className="admin-list-scroll professor-section-scroll">
									<div className="professor-group-list">
										{/* Current Semester Sections */}
										{sectionGrouping.currentSectionGroups.map((group) => (
											<section key={group.key} className="subpanel stack professor-group">
												<div className="professor-group-header">
													<div>
														<p className="eyebrow">{group.semesterLabel}</p>
														<h3>{group.subjectLabel} Sections</h3>
													</div>
													<span className="pill subtle">
														{group.sections.length} section{group.sections.length === 1 ? '' : 's'}
													</span>
												</div>

												<div className="professor-row-list">
													{group.sections.map((section) => (
														<article key={section.section_id} className="professor-section-row">
															<div className="professor-section-main">
																<strong>{section.course.course_code}</strong>
																<span>{section.course.title}</span>
															</div>
															<div className="professor-section-stat">
																<span className="info-label">Enrolled</span>
																<strong>{section.enrolled_count}</strong>
															</div>
															<button type="button" className="pill-button" onClick={() => setSelectedSectionId(section.section_id)}>
																Access Codes
															</button>
														</article>
													))}
												</div>
											</section>
										))}

										{/* Previous Semesters Dropdown */}
										{sectionGrouping.previousSectionGroups.length > 0 ? (
											<section className="subpanel stack professor-group">
												<button
													type="button"
													className="professor-group-toggle"
													onClick={() => setExpandedPreviousSemesters(!expandedPreviousSemesters)}
													aria-expanded={expandedPreviousSemesters ? 'true' : 'false'}
												>
													<div>
														<p className="eyebrow">Previous Semesters</p>
														<h3>Archive</h3>
													</div>
													<span className="pill subtle">
														{sectionGrouping.previousSectionGroups.reduce((sum, g) => sum + g.sections.length, 0)} section
														{sectionGrouping.previousSectionGroups.reduce((sum, g) => sum + g.sections.length, 0) === 1 ? '' : 's'}
													</span>
												</button>

												{expandedPreviousSemesters ? (
													<div className="professor-previous-semesters">
														{sectionGrouping.previousSectionGroups.map((group) => (
															<details key={group.key} className="professor-previous-group">
																<summary className="professor-previous-group-summary">
																	<span>
																		<strong>{group.semesterLabel}</strong> - {group.subjectLabel}
																	</span>
																	<span className="pill subtle">{group.sections.length}</span>
																</summary>

																<div className="professor-row-list">
																	{group.sections.map((section) => (
																		<article key={section.section_id} className="professor-section-row">
																			<div className="professor-section-main">
																				<strong>{section.course.course_code}</strong>
																				<span>{section.course.title}</span>
																			</div>
																			<div className="professor-section-stat">
																				<span className="info-label">Enrolled</span>
																				<strong>{section.enrolled_count}</strong>
																			</div>
																			<button type="button" className="pill-button" onClick={() => setSelectedSectionId(section.section_id)}>
																				Access Codes
																			</button>
																		</article>
																	))}
																</div>
															</details>
														))}
													</div>
												) : null}
											</section>
										) : null}
									</div>
								</div>
							)
						) : null}
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
							<FormField id="professor-name" label="Name" value={name} onChange={setName} required />
							<FormField id="professor-email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />

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

				{activeView === 'password' ? (
					<section className="subpanel stack">
						<div className="panel-header">
							<div>
								<p className="eyebrow">Authentication</p>
								<h3>Change Password</h3>
							</div>
						</div>

						{requiresPasswordChange ? <StatusMessage kind="info" message="It appears to be your first time logging in. Password change is mandatory." /> : null}

						<form className="stack" onSubmit={submitPassword}>
							<FormField id="professor-new-password" label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required />
							<FormField
								id="professor-confirm-password"
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
			</section>

			{selectedSection ? (
				<div className="dialog-backdrop" role="presentation" onClick={() => (selectedState.isGenerating || selectedState.revokingCode ? null : setSelectedSectionId(null))}>
					<section className="dialog-card professor-code-dialog" role="dialog" aria-modal="true" aria-labelledby="professor-access-code-title" onClick={(event) => event.stopPropagation()}>
						<div className="panel-header">
							<div>
								<p className="eyebrow">
									{selectedSection.semester.term} {selectedSection.semester.year}
								</p>
								<h3 id="professor-access-code-title">{selectedSection.course.course_code} Access Codes</h3>
							</div>
							<span className="pill subtle">{selectedCodes.length} total</span>
						</div>

						<div className="stack">
							<p>
								<strong>{selectedSection.course.title}</strong>
								<br />
								<span className="sidebar-meta">
									{formatMeeting(selectedSection)} • Enrolled {selectedSection.enrolled_count}
								</span>
							</p>

							<form className="admin-action-row professor-code-form" onSubmit={(event) => void handleGenerate(selectedSection.section_id, event)}>
								<div className="professor-code-quantity">
									<FormField
										id={`generate-count-${selectedSection.section_id}`}
										label="Codes to Generate"
										type="number"
										value={selectedState.quantity}
										onChange={(value) => updateCardState(selectedSection.section_id, { quantity: value })}
										required
									/>
								</div>
								<button type="submit" className="primary-button" disabled={selectedState.isGenerating}>
									{selectedState.isGenerating ? 'Generating...' : 'Generate'}
								</button>
							</form>

							{selectedState.message ? <StatusMessage kind="success" message={selectedState.message} /> : null}
							{selectedState.error ? <StatusMessage kind="error" message={selectedState.error} /> : null}

							{selectedCodes.length === 0 ? (
								<p className="sidebar-copy">No active access codes are available for this section.</p>
							) : (
								<div className="professor-code-list">
									{selectedCodes.map((code) => (
										<div key={code.key} className="professor-code-row">
											<div>
												<strong>{code.value}</strong>
												<p className="sidebar-copy">Status: {code.used ? 'Used' : 'Available'}</p>
											</div>
											<button
												type="button"
												className="secondary-button admin-danger-button"
												onClick={() => void handleRevoke(selectedSection.section_id, code.value)}
												disabled={selectedState.revokingCode === code.value}
											>
												{selectedState.revokingCode === code.value ? 'Revoking...' : 'Revoke'}
											</button>
										</div>
									))}
								</div>
							)}
						</div>

						<div className="dialog-actions">
							<button type="button" className="secondary-button" onClick={() => setSelectedSectionId(null)} disabled={selectedState.isGenerating || Boolean(selectedState.revokingCode)}>
								Close
							</button>
						</div>
					</section>
				</div>
			) : null}
		</ProfessorOnly>
	);
}
