import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const backendTarget = env.VITE_BACKEND_TARGET || 'http://127.0.0.1:3000';

	return {
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
	};
});
