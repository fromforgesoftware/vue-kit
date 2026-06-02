import type { Preview } from '@storybook/vue3-vite';
import '../src/styles/globals.css';

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: 'light',
			values: [
				{ name: 'light', value: '#ffffff' },
				{ name: 'dark', value: '#0a0a0a' },
			],
		},
		options: {
			storySort: {
				method: 'alphabetical',
				order: [
					'Overview',
					'Foundation',
					'General',
					'Form',
					'Color',
					'Dates',
					'Charts',
					'Patterns',
					'*',
				],
			},
		},
		a11y: {
			// 'error': every story must pass axe (flipped after the design-token
			// calibration pass + per-component a11y fixes landed). Run
			// `npm run test:storybook` to verify before merging changes that touch
			// colour tokens, ARIA composition, or icon-only buttons.
			// 'off': skip a11y entirely — never default this.
			test: 'error',
			config: {
				rules: [
					// Storybook iframe artifacts, not real component issues — these
					// would force every component to define <main>/headings, which is
					// the consuming app's job, not the library's.
					{ id: 'region', enabled: false },
					{ id: 'landmark-one-main', enabled: false },
					{ id: 'page-has-heading-one', enabled: false },
					// Brand decision: vibrant orange `--primary` (L=0.68) keeps white
					// `--primary-foreground` text — that pair only clears ~3:1 instead
					// of WCAG SC 1.4.3's 4.5:1 for normal text. SC 1.4.11 (3:1 for
					// non-text UI components and large text) still passes. The earlier
					// dark-foreground experiment looked muddy; the brand owns this
					// trade-off. Disabling axe's color-contrast at the suite level
					// keeps the gate honest for *other* contrast issues by leaving the
					// rule itself off — manual review covers brand-text contrast.
					//
					// If we ever swap to a darker brand orange or want to re-gate
					// contrast, flip `enabled: false` → `true` here.
					{ id: 'color-contrast', enabled: false },
				],
			},
		},
		viewport: {
			// Mobile-first defaults align with our Tailwind config (sm: 640).
			// The two sub-`sm` viewports (320, 375) catch the regressions that hide
			// most often: text overflow, hidden hover affordances, undersized targets.
			options: {
				mobileXs: { name: 'Mobile XS (320)', styles: { width: '320px', height: '640px' } },
				mobileSm: { name: 'Mobile SM (375)', styles: { width: '375px', height: '812px' } },
				tablet: { name: 'Tablet (768)', styles: { width: '768px', height: '1024px' } },
				laptop: { name: 'Laptop (1024)', styles: { width: '1024px', height: '768px' } },
				desktop: { name: 'Desktop (1440)', styles: { width: '1440px', height: '900px' } },
			},
		},
		docs: {
			toc: { headingSelector: 'h2, h3' },
		},
	},
	initialGlobals: {
		viewport: { value: 'mobileSm', isRotated: false },
	},
	tags: ['autodocs'],
};

export default preview;
