import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import ThemeManager from './ThemeManager.vue';
import {
	inBody,
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';
import type { ThemeOption } from './theme-manager';

// ── Module-level fixtures ───────────────────────────────────────────────────

const THEMES: ThemeOption[] = [
	{ name: 'Light', value: 'light' },
	{ name: 'Dark', value: 'dark' },
	{ name: 'Auto', value: 'auto' },
];

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/ThemeManager',
	component: ThemeManager,
	tags: ['!autodocs'],
	argTypes: {
		themes: {
			control: 'object',
			description: 'Available theme options to display in the select dropdown.',
		},
	},
	args: {
		themes: THEMES,
	},
	parameters: {
		docs: {
			description: {
				component:
					'A theme selector that persists user theme preference. Includes a custom color panel when "Custom" is selected.',
			},
		},
	},
	render: (args) => ({
		components: { ThemeManager },
		setup: () => ({ args }),
		template: `<ThemeManager v-bind="args" />`,
	}),
} satisfies Meta<typeof ThemeManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithCustomTheme: Story = {
	parameters: {
		docs: {
			description: {
				story: 'When "Custom" is selected, a color panel appears for fine-tuning theme colors.',
			},
		},
		// Same Storybook iframe artifact as InteractiveSelectTheme — Reka
		// applies aria-hidden to the canvas root while the Select is open.
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
		},
	},
	play: async ({ canvasElement }) => {
		// Select the custom option via the dropdown
		const trigger = canvasElement.querySelector(
			'[data-slot="theme-manager-select"]',
		) as HTMLElement;
		if (trigger) await userEvent.click(trigger);
		const body = inBody();
		const customOption = body.getByText('Custom');
		await userEvent.click(customOption);
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveSelectTheme: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		// Opening the Select makes Reka apply aria-hidden to the Storybook
		// canvas root for focus-trap; the root still contains the iframe's
		// focusable shell, which axe flags as aria-hidden-focus. This is a
		// Storybook iframe artifact, not a component issue.
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="theme-manager-select"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);

		const body = inBody();
		const darkOption = body.getByText('Dark');
		await expect(darkOption).toBeInTheDocument();
		await userEvent.click(darkOption);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="theme-manager-select"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		expectMinTargetSize(trigger, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			await expect(root).toBeVisible();
			expectNoHorizontalOverflow(root);
			for (const el of canvasElement.querySelectorAll('button, [role="button"], a')) {
				expectMinTargetSize(el, 24);
			}
		});
	},
};
