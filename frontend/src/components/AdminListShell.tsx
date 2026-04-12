/*
Adi Avraham
CMSC495 Group Golf Capstone Project
AdminListShell.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Wraps admin tool lists with shared search, pagination, and list-window UI.
*/

import type { ReactNode } from 'react';
import type { Meta } from '../types/api';
import { FormField } from './FormField';
import { PaginationControls } from './PaginationControls';
import { StatusMessage } from './StatusMessage';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type AdminListShellProps = {
	searchId: string,
	searchValue: string,
	onSearchChange: (value: string) => void,
	searchPlaceholder: string,
	pageSizeId: string,
	pageSize: number,
	onPageSizeChange: (value: number) => void,
	meta: Meta,
	setPage: (page: number) => void,
	children: ReactNode,
	statusMessage?: string,
	statusError?: string,
};

export function AdminListShell({
	searchId,
	searchValue,
	onSearchChange,
	searchPlaceholder,
	pageSizeId,
	pageSize,
	onPageSizeChange,
	meta,
	setPage,
	children,
	statusMessage,
	statusError,
}: AdminListShellProps) {
	return (
		<section className="panel stack admin-data-panel">
			<div className="catalog-toolbar">
				<section className="catalog-toolbar-box catalog-toolbar-filters">
					<div className="catalog-filter-grid">
						<FormField id={searchId} label="Search" value={searchValue} onChange={onSearchChange} placeholder={searchPlaceholder} />
						<label className="field" htmlFor={pageSizeId}>
							<span>Items Per Page</span>
							<select id={pageSizeId} value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
								{PAGE_SIZE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
							</select>
						</label>
					</div>
				</section>
			</div>
			{statusMessage ? <StatusMessage kind="success" message={statusMessage} /> : null}
			{statusError ? <StatusMessage kind="error" message={statusError} /> : null}
			<div className="catalog-list-window">
				<PaginationControls meta={meta} onPageChange={setPage} position="top" />
				<div className="catalog-list-scroll">
					{children}
				</div>
				<PaginationControls meta={meta} onPageChange={setPage} />
			</div>
		</section>
	);
}
