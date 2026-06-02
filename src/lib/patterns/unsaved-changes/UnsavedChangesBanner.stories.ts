import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import UnsavedChangesBanner from './UnsavedChangesBanner.vue';
import { expectMinTargetSize, forEachViewport } from '../../../test-utils/playHelpers.js';

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/UnsavedChanges/Banner',
	component: UnsavedChangesBanner,
	tags: ['!autodocs'],
	argTypes: {
		visible: { control: 'boolean', description: 'Whether the banner is visible.' },
		jiggling: { control: 'boolean', description: 'Whether the banner plays the jiggle animation.' },
		title: { control: 'text', description: 'Banner title text.' },
		saveLabel: { control: 'text', description: 'Save button label.' },
		resetLabel: { control: 'text', description: 'Reset/discard button label.' },
		onSave: { action: 'save' },
		onReset: { action: 'reset' },
	},
	args: {
		visible: true,
		jiggling: false,
		onSave: fn(),
		onReset: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A floating bar at the bottom of the screen that appears when there are unsaved changes. Includes a jiggle animation to draw attention when navigation is blocked.',
			},
		},
	},
	render: (args) => ({
		components: { UnsavedChangesBanner },
		setup: () => ({ args }),
		template: `
      <UnsavedChangesBanner
        v-bind="args"
        @save="args.onSave"
        @reset="args.onReset"
      />
    `,
	}),
} satisfies Meta<typeof UnsavedChangesBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const JigglingState: Story = {
	args: {
		jiggling: true,
	},
};

export const CustomLabels: Story = {
	args: {
		title: 'You have unsaved edits',
		saveLabel: 'Apply',
		resetLabel: 'Discard',
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveSave: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const saveBtn = canvasElement.querySelector(
			'[data-slot="unsaved-changes-save"]',
		) as HTMLElement;
		await expect(saveBtn).toBeInTheDocument();
		await userEvent.click(saveBtn);
		await expect(args.onSave).toHaveBeenCalled();
	},
};

export const InteractiveDiscard: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const discardBtn = canvasElement.querySelector(
			'[data-slot="unsaved-changes-discard"]',
		) as HTMLElement;
		await expect(discardBtn).toBeInTheDocument();
		await userEvent.click(discardBtn);
		await expect(args.onReset).toHaveBeenCalled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const saveBtn = canvasElement.querySelector(
			'[data-slot="unsaved-changes-save"]',
		) as HTMLElement;
		const discardBtn = canvasElement.querySelector(
			'[data-slot="unsaved-changes-discard"]',
		) as HTMLElement;
		await expect(saveBtn).toBeInTheDocument();
		await expect(discardBtn).toBeInTheDocument();
		expectMinTargetSize(saveBtn, 24);
		expectMinTargetSize(discardBtn, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const banner = canvasElement.querySelector(
				'[data-slot="unsaved-changes-banner"]',
			) as HTMLElement;
			await expect(banner).toBeInTheDocument();
		});
	},
};
