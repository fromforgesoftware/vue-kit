/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
const dirname =
	typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [vue(), tailwindcss()],
	esbuild: {
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
				target: 'es2022',
				useDefineForClassFields: false,
			},
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
			// Subpath aliases must come BEFORE the bare package alias so
			// vite matches the more-specific entries first.
			'@fromforgesoftware/ts-kit/date': resolve(__dirname, '../ts-kit/src/date/index.ts'),
			'@fromforgesoftware/ts-kit/enums': resolve(__dirname, '../ts-kit/src/enums/index.ts'),
			'@fromforgesoftware/ts-kit/errors': resolve(__dirname, '../ts-kit/src/errors/index.ts'),
			'@fromforgesoftware/ts-kit/features': resolve(__dirname, '../ts-kit/src/features/index.ts'),
			'@fromforgesoftware/ts-kit/http': resolve(__dirname, '../ts-kit/src/http/index.ts'),
			'@fromforgesoftware/ts-kit/i18n': resolve(__dirname, '../ts-kit/src/i18n/index.ts'),
			'@fromforgesoftware/ts-kit/jsonapi-client': resolve(
				__dirname,
				'../ts-kit/src/jsonapi-client/index.ts',
			),
			'@fromforgesoftware/ts-kit/jsonapi': resolve(__dirname, '../ts-kit/src/jsonapi/index.ts'),
			'@fromforgesoftware/ts-kit/legacy-logger': resolve(
				__dirname,
				'../ts-kit/src/legacy-logger/index.ts',
			),
			'@fromforgesoftware/ts-kit/log': resolve(__dirname, '../ts-kit/src/log/index.ts'),
			'@fromforgesoftware/ts-kit/number': resolve(__dirname, '../ts-kit/src/number/index.ts'),
			'@fromforgesoftware/ts-kit/reactive': resolve(__dirname, '../ts-kit/src/reactive/index.ts'),
			'@fromforgesoftware/ts-kit/resource-state': resolve(
				__dirname,
				'../ts-kit/src/resource-state/index.ts',
			),
			'@fromforgesoftware/ts-kit/storage': resolve(__dirname, '../ts-kit/src/storage/index.ts'),
			'@fromforgesoftware/ts-kit/types': resolve(__dirname, '../ts-kit/src/types/index.ts'),
			'@fromforgesoftware/ts-kit': resolve(__dirname, '../ts-kit/src/index.ts'),
		},
	},
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, 'src/index.ts'),
				'test-utils': resolve(__dirname, 'src/test-utils/index.ts'),
			},
			name: 'ForgeVueKit',
			formats: ['es'],
		},
		cssCodeSplit: false,
		rollupOptions: {
			// Anything the consumer should provide. Heavy deps + framework + peer
			// packages get externalised so the bundle is small and consumers
			// dedupe on their copy of vue/reka/etc.
			external: [
				'vue',
				'vue-router',
				'pinia',
				'@fromforgesoftware/ts-kit',
				/^@fromforgesoftware\/ts-kit\//,
				'reka-ui',
				'@lucide/vue',
				'@vueuse/core',
				'@tanstack/vue-table',
				'@tanstack/vue-virtual',
				'@internationalized/date',
				'class-variance-authority',
				'clsx',
				'tailwind-merge',
				'chart.js',
				'chartjs-plugin-datalabels',
				'vue-chartjs',
				'vue-sonner',
			],
			output: {
				globals: {
					vue: 'Vue',
				},
			},
		},
	},
	test: {
		workspace: [
			// Unit tests workspace - runs component tests with jsdom
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.test.ts'],
					environment: 'jsdom',
					setupFiles: ['./vitest.setup.ts'],
					globals: true,
				},
			},
			// Storybook tests workspace - runs interaction tests in browser
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: path.join(dirname, '.storybook'),
					}),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: 'playwright',
						instances: [
							{
								browser: 'chromium',
							},
						],
					},
					setupFiles: ['.storybook/vitest.setup.ts'],
				},
			},
		],
	},
});
