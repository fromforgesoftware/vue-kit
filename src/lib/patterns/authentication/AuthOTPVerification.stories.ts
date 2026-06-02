import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import AuthOTPVerification from './AuthOTPVerification.vue';
import { expectMinTargetSize } from '../../../test-utils/playHelpers';

const meta = {
	title: 'Authentication/OTPVerification',
	component: AuthOTPVerification,
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen' },
	argTypes: {
		email: { control: 'text' },
		realm: { control: 'text' },
		resendCooldown: { control: { type: 'number', min: 0, max: 120 } },
		loading: { control: 'boolean' },
		error: { control: 'text' },
	},
} satisfies Meta<typeof AuthOTPVerification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OTPVerification: Story = {
	render: (args) => ({
		components: { AuthOTPVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthOTPVerification v-bind="args" />
      </div>
    `,
	}),
	args: {
		email: 'admin@demo.com',
		realm: 'acme',
		resendCooldown: 60,
		loading: false,
		error: undefined,
	},
};

export const OTPVerificationError: Story = {
	render: (args) => ({
		components: { AuthOTPVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthOTPVerification v-bind="args" />
      </div>
    `,
	}),
	args: {
		email: 'admin@demo.com',
		realm: 'acme',
		resendCooldown: 35,
		loading: false,
		error: 'Incorrect code. Please try again.',
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthOTPVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthOTPVerification v-bind="args" />
      </div>
    `,
	}),
	args: { email: 'admin@demo.com', realm: 'acme', resendCooldown: 60, loading: false },
	play: async ({ canvasElement }) => {
		const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLElement;
		await expect(submit).toBeInTheDocument();
		expectMinTargetSize(submit, 24);
	},
};

export const InteractiveTabOrder: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthOTPVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthOTPVerification v-bind="args" />
      </div>
    `,
	}),
	args: { email: 'admin@demo.com', realm: 'acme', resendCooldown: 60, loading: false },
	play: async ({ canvasElement }) => {
		const inputs = canvasElement.querySelectorAll('input');
		await expect(inputs.length).toBeGreaterThan(0);
		// Focus first PinInput cell, then Tab — should advance to the next focusable element
		const first = inputs[0] as HTMLInputElement;
		first.focus();
		await expect(first).toHaveFocus();
	},
};
