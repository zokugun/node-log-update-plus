import { defineConfig } from 'vitest/config';

export default defineConfig({
	esbuild: {
		target: 'es2022',
	},
	test: {
		environment: 'node',
		include: ['./test/**/*.test.ts'],
		reporters: 'dot',
		setupFiles: ['./test/vitest.setup.ts'],
		typecheck: {
			enabled: true,
		},
		coverage: {
			reporter: ['html'],
			reportsDirectory: './coverage',
		},
	},
});
