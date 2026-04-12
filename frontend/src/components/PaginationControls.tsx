/*
Adi Avraham
CMSC495 Group Golf Capstone Project
PaginationControls.tsx
input
runtime requests, imported dependencies, and function arguments
output
exported modules, rendered UI, or application side effects
description
Renders reusable pagination controls for paged list and catalog views.
*/

import type { Meta } from '../types/api';

type PaginationControlsProps = {
	meta: Meta,
	onPageChange: (page: number) => void,
	position?: 'top' | 'bottom',
};

// Renders a consistent previous/next pagination control set for paged list views.
export function PaginationControls({ meta, onPageChange, position = 'bottom' }: PaginationControlsProps) {
	return (
		<div className={`catalog-pagination ${position === 'top' ? 'catalog-pagination-top' : ''}`}>
			<button type="button" className="secondary-button" onClick={() => onPageChange(Math.max(meta.page - 1, 1))} disabled={meta.page <= 1}>
				Previous
			</button>
			<p className="sidebar-meta">
				Page {meta.page} of {Math.max(meta.totalPages, 1)}. Showing {meta.total === 0 ? 0 : meta.limit < meta.total ? Math.min(meta.limit, meta.total - (meta.page - 1) * meta.limit) : meta.total} of {meta.total}
			</p>
			<button type="button" className="secondary-button" onClick={() => onPageChange(Math.min(meta.page + 1, Math.max(meta.totalPages, 1)))} disabled={meta.page >= Math.max(meta.totalPages, 1)}>
				Next
			</button>
		</div>
	);
}
