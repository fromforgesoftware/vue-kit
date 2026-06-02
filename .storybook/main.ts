import type { StorybookConfig } from '@storybook/vue3-vite';

const config: StorybookConfig = {
	stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs',
		'@storybook/addon-onboarding',
	],
	framework: '@storybook/vue3-vite',
	// `@vitest/browser/context` throws when imported outside the Vitest runtime;
	// exclude it from Vite's dependency pre-bundling so dev-mode Storybook never
	// loads it. The play-test helpers import it dynamically, only at test time.
	viteFinal: async (config) => {
		config.optimizeDeps = config.optimizeDeps ?? {};
		const exclude = config.optimizeDeps.exclude ?? [];
		config.optimizeDeps.exclude = Array.from(new Set([...exclude, '@vitest/browser/context']));
		return config;
	},
};
export default config;
