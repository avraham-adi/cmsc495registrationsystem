import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
	root: frontendRoot,
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			'/api': 'http://127.0.0.1:3000',
			'/user': 'http://127.0.0.1:3000',
			'/admin': 'http://127.0.0.1:3000',
			'/course': 'http://127.0.0.1:3000',
			'/prerequisite': 'http://127.0.0.1:3000',
			'/section': 'http://127.0.0.1:3000',
			'/semester': 'http://127.0.0.1:3000',
			'/enrollment': 'http://127.0.0.1:3000',
		},
	},
});
