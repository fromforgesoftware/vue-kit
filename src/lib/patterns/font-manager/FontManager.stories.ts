import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import FontManager from './FontManager.vue';
import {
	inBody,
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';
import type { FontSizeOption } from './font-manager.js';

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/FontManager',
	component: FontManager,
	tags: ['!autodocs'],
	argTypes: {
		options: {
			control: 'object',
			description: 'Override the default set of font size options.',
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					'Font Manager allows users to adjust the global font size of the application. Changes are persisted to localStorage and applied to the root HTML element.',
			},
		},
	},
	render: (args) => ({
		components: { FontManager },
		setup: () => ({ args }),
		template: `<FontManager v-bind="args" />`,
	}),
} satisfies Meta<typeof FontManager>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const CustomOptions: Story = {
	args: {
		options: [
			{ label: 'Small (12px)', value: 'smaller', description: '12px' },
			{ label: 'Default (16px)', value: 'default', description: '16px' },
			{ label: 'Large (20px)', value: 'large', description: '20px' },
		] as FontSizeOption[],
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveSelectSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		// Storybook iframe artifact: when the Select opens, Reka aria-hides
		// the canvas root for focus-trap; the iframe's residual focusable
		// shell content trips axe even though the component is correct.
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', enabled: false }] },
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="font-manager-select"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);

		const body = inBody();
		// Pick the "Large" option from the dropdown
		const largeOption = body.getByText('Large');
		await expect(largeOption).toBeInTheDocument();
		await userEvent.click(largeOption);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="font-manager-select"]') as HTMLElement;
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
