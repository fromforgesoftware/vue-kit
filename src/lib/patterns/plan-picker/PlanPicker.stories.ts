import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import PlanPicker from './PlanPicker.vue';
import Button from '../../general/button/Button.vue';
import { inBody, expectMinTargetSize, forEachViewport } from '../../../test-utils/playHelpers.js';
import type { PlanOption, PlanFeature } from './plan-picker.js';

// ── Module-level fixtures ───────────────────────────────────────────────────

const PLANS: PlanOption[] = [
	{ value: 'essential', name: 'Essential', price: '$4 per member/month' },
	{ value: 'standard', name: 'Standard', price: '$19 per member/month' },
	{ value: 'enterprise', name: 'Enterprise', price: '$32 per member/month' },
];

const FEATURES: PlanFeature[] = [
	{ label: 'Create unlimited projects' },
	{ label: 'Remove watermarks' },
	{ label: 'Add unlimited users and free viewers' },
];

const PLANS_WITH_DISABLED: PlanOption[] = [
	{ value: 'essential', name: 'Essential', price: '$4 per member/month' },
	{ value: 'standard', name: 'Standard', price: '$19 per member/month' },
	{
		value: 'enterprise',
		name: 'Enterprise',
		price: '$32 per member/month (contact sales)',
		disabled: true,
	},
];

// ── Meta ────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/PlanPicker',
	component: PlanPicker,
	tags: ['!autodocs'],
	argTypes: {
		open: { control: 'boolean', description: 'Whether the dialog is open.' },
		plans: { control: 'object', description: 'Available plan options.' },
		modelValue: { control: 'text', description: 'Currently selected plan value.' },
		features: { control: 'object', description: 'Features to display below the plan options.' },
		title: { control: 'text', description: 'Dialog title.' },
		description: { control: 'text', description: 'Dialog subtitle / description.' },
		confirmLabel: { control: 'text', description: 'Confirm button label.' },
		cancelLabel: { control: 'text', description: 'Cancel button label.' },
		loading: { control: 'boolean', description: 'Whether the confirm action is loading.' },
		onConfirm: { action: 'confirm' },
		onCancel: { action: 'cancel' },
		'onUpdate:open': { action: 'update:open' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		open: undefined,
		plans: PLANS,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		features: FEATURES as any,
		modelValue: 'standard',
		onConfirm: fn(),
		onCancel: fn(),
		'onUpdate:open': fn(),
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'A dialog for selecting and changing subscription plans. Displays plan options as selectable cards with a features list and confirm/cancel actions.',
			},
		},
	},
	render: (args) => ({
		components: { PlanPicker, Button },
		setup() {
			const open = ref(args.open ?? false);
			function onUpdateOpen(v: boolean) {
				open.value = v;
				args['onUpdate:open']?.(v);
			}
			return { args, open, onUpdateOpen };
		},
		template: `
      <div>
        <Button @click="open = true">Open plan picker</Button>
        <PlanPicker
          v-bind="args"
          :open="open"
          @confirm="args.onConfirm"
          @cancel="args.onCancel"
          @update:open="onUpdateOpen"
          @update:modelValue="args['onUpdate:modelValue']"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof PlanPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithoutFeatures: Story = {
	args: {
		features: [],
	},
};

export const WithDisabledOption: Story = {
	args: {
		plans: PLANS_WITH_DISABLED,
	},
};

export const Loading: Story = {
	args: {
		loading: true,
	},
};

// ── Interactive stories ───────────────────────────────────────────────────────

export const InteractiveSelectPlan: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		open: true,
		modelValue: 'standard',
	},
	play: async ({ args }) => {
		const body = inBody();
		// Click on the Essential plan option
		const essentialOption = body.getByText('Essential');
		await userEvent.click(essentialOption);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('essential');
	},
};

export const InteractiveConfirm: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		open: true,
		modelValue: 'standard',
	},
	play: async ({ args }) => {
		const body = inBody();
		const confirmBtn = body.getByRole('button', { name: /change plan/i });
		await userEvent.click(confirmBtn);
		await expect(args.onConfirm).toHaveBeenCalledWith('standard');
	},
};

export const InteractiveCancel: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async ({ args }) => {
		const body = inBody();
		const cancelBtn = body.getByRole('button', { name: /cancel/i });
		await userEvent.click(cancelBtn);
		await expect(args.onCancel).toHaveBeenCalled();
	},
};

export const InteractiveDisabledOptionNotSelectable: Story = {
	tags: ['!autodocs', 'test'],
	args: {
		open: true,
		plans: PLANS_WITH_DISABLED,
		modelValue: 'standard',
	},
	play: async ({ args }) => {
		const body = inBody();
		// Try clicking the disabled enterprise option label
		const enterpriseOption = body.getByText('Enterprise');
		await userEvent.click(enterpriseOption);
		// The selection should not have changed to enterprise
		await expect(args['onUpdate:modelValue']).not.toHaveBeenCalledWith('enterprise');
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

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { open: true },
	play: async () => {
		await forEachViewport(async () => {
			const body = inBody();
			const dialog = body.getByRole('dialog');
			await expect(dialog).toBeInTheDocument();
		});
	},
};
