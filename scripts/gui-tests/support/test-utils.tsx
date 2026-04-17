/*
Adi Avraham
CMSC495 Group Golf Capstone Project
test-utils.tsx
input
test components, router options, and mocked route entries
output
router-aware render helpers for GUI component tests
description
Provides shared render helpers for GUI tests that need router context and placeholder routes.
*/

import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

type RenderWithRouterOptions = {
	initialEntries?: string[];
	path?: string;
};

export function renderWithRouter(ui: ReactElement, { initialEntries = ['/'], path = '/' }: RenderWithRouterOptions = {}) {
	return render(
		<MemoryRouter initialEntries={initialEntries}>
			<Routes>
				<Route path={path} element={ui} />
				<Route path="/login" element={<div>Login Route</div>} />
				<Route path="/change-password" element={<div>Change Password Route</div>} />
			</Routes>
		</MemoryRouter>
	);
}
