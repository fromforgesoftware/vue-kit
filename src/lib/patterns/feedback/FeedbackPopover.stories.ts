import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import FeedbackPopover from './FeedbackPopover.vue';
import {
	inBody,
	expectMinTargetSize,
	forEachViewport,
	expectNoHorizontalOverflow,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Patterns/Feedback Popover',
	component: FeedbackPopover,
	tags: ['!autodocs'],
	argTypes: {
		title: { control: 'text', description: 'Popover heading text.' },
		placeholder: { control: 'text', description: 'Textarea placeholder text.' },
		submitLabel: { control: 'text', description: 'Submit button label.' },
		triggerLabel: { control: 'text', description: 'Trigger button label.' },
		triggerVariant: {
			control: 'select',
			options: ['default', 'outline', 'ghost', 'secondary', 'destructive', 'link'],
			description: 'Trigger button variant.',
		},
		loading: { control: 'boolean', description: 'Whether the form is currently submitting.' },
		onSubmit: { action: 'submit' },
	},
	args: {
		title: 'Send us feedback',
		placeholder: 'How can we improve?',
		submitLabel: 'Send feedback',
		triggerLabel: 'Feedback',
		triggerVariant: 'outline',
		loading: false,
		onSubmit: fn(),
	},
	parameters: {
		docs: {
			description: {
				component: 'A popover form that collects user feedback text and emits it on submit.',
			},
		},
	},
	render: (args) => ({
		components: { FeedbackPopover },
		setup: () => ({ args }),
		template: `<FeedbackPopover v-bind="args" @submit="args.onSubmit" />`,
	}),
} satisfies Meta<typeof FeedbackPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ──────────────────────────────────────────────────────────────

export const Default: Story = {};

export const CustomLabels: Story = {
	args: {
		title: 'Report a problem',
		placeholder: "Describe the issue you're experiencing...",
		submitLabel: 'Submit report',
		triggerLabel: 'Report issue',
		triggerVariant: 'ghost',
	},
};

export const LoadingState: Story = {
	args: {
		loading: true,
	},
};

// ── Interactive (hidden from autodocs, run as tests) ──────────────────────────

export const InteractiveOpensPopover: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Feedback' });
		await userEvent.click(trigger);
		const body = inBody();
		const content = body.getByRole('dialog');
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveSubmitEmits: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Feedback' });
		await userEvent.click(trigger);

		const body = inBody();
		const textarea = body.getByRole('textbox');
		await userEvent.type(textarea, 'This is my feedback');

		const submitBtn = body.getByRole('button', { name: 'Send feedback' });
		await userEvent.click(submitBtn);
		await expect(args.onSubmit).toHaveBeenCalledWith('This is my feedback');
	},
};

export const InteractiveDisabledSubmit: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Feedback' });
		await userEvent.click(trigger);

		const body = inBody();
		const submitBtn = body.getByRole('button', { name: 'Send feedback' });
		await expect(submitBtn).toBeDisabled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Feedback' });
		expectMinTargetSize(trigger);
		await userEvent.click(trigger);

		const body = inBody();
		const submitBtn = body.getByRole('button', { name: 'Send feedback' });
		expectMinTargetSize(submitBtn);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { FeedbackPopover },
		setup: () => ({}),
		template: `<div data-test-root class="flex flex-wrap gap-2 p-2"><FeedbackPopover /></div>`,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
		});
	},
};
