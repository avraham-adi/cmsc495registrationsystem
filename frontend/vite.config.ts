import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));
const backendTarget = 'https://cmsc495registrationsystem-production.up.railway.app';

export default defineConfig({
	root: frontendRoot,
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['../scripts/gui-tests/setup.ts'],
		include: ['../scripts/gui-tests/**/*.test.ts', '../scripts/gui-tests/**/*.test.tsx'],
		css: false,
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/user': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/admin': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/course': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/prerequisite': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/section': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/semester': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
			'/enrollment': {
				target: backendTarget,
				changeOrigin: true,
				secure: true,
			},
		},
	},
});
