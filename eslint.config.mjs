import js from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	globalIgnores(['frontend/dist/**']),
	js.configs.recommended,
	{
		files: ['backend/**/*.{js,mjs,cjs}', 'scripts/**/*.{js,mjs,cjs}'],
		languageOptions: {
			globals: globals.node,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
	},
]);
