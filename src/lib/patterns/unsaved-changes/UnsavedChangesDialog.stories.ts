import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect } from 'storybook/test';
import { ref } from 'vue';
import UnsavedChangesDialog from './UnsavedChangesDialog.vue';
import Button from '../../general/button/Button.vue';
import { inBody, expectMinTargetSize } from '../../../test-utils/playHelpers.js';

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/UnsavedChanges/Dialog',
	component: UnsavedChangesDialog,
	tags: ['!autodocs'],
	argTypes: {
		open: { control: 'boolean', description: 'Controlled open state.' },
		title: { control: 'text', description: 'Dialog title.' },
		description: { control: 'text', description: 'Dialog description text.' },
		confirmText: { control: 'text', description: 'Confirm button text.' },
		cancelText: { control: 'text', description: 'Cancel button text.' },
		confirmVariant: {
			control: 'select',
			options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
			description: 'Confirm button variant.',
		},
		onConfirm: { action: 'confirm' },
		onCancel: { action: 'cancel' },
	},
	args: {
		open: undefined,
		onConfirm: fn(),
		onCancel: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A confirmation dialog that appears when the user tries to navigate away from a page with unsaved changes.',
			},
		},
	},
	render: (args) => ({
		components: { UnsavedChangesDialog, Button },
		setup() {
			const open = ref(args.open ?? false);
			return { args, open };
		},
		template: `
      <div>
        <Button @click="open = true">Open dialog</Button>
        <UnsavedChangesDialog
          v-bind="args"
          :open="open"
          @confirm="args.onConfirm"
          @cancel="args.onCancel"
          @update:open="open = $event"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof UnsavedChangesDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const CustomLabels: Story = {
	args: {
		title: 'Discard draft?',
		description: 'Your draft has not been saved. If you leave now, your changes will be lost.',
		confirmText: 'Discard',
		cancelText: 'Keep editing',
	},
};

export const DestructiveVariant: Story = {
	args: {
		confirmVariant: 'destructive',
		confirmText: 'Delete and leave',
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveConfirm: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		const confirmBtn = body.getByRole('button', { name: /leave/i });
		await expect(confirmBtn).toBeInTheDocument();
		await confirmBtn.click();
		await expect(args.onConfirm).toHaveBeenCalled();
	},
};

export const InteractiveCancel: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		const cancelBtn = body.getByRole('button', { name: /stay/i });
		await expect(cancelBtn).toBeInTheDocument();
		await cancelBtn.click();
		await expect(args.onCancel).toHaveBeenCalled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async () => {
		const body = inBody();
		const buttons = body.getAllByRole('button');
		for (const btn of buttons) {
			expectMinTargetSize(btn, 24);
		}
	},
};
