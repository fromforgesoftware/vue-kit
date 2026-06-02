import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import AuthForgotPassword from './AuthForgotPassword.vue';
import { expectMinTargetSize } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Authentication/ForgotPassword',
	component: AuthForgotPassword,
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen' },
	argTypes: {
		loading: { control: 'boolean' },
	},
} satisfies Meta<typeof AuthForgotPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ForgotPassword: Story = {
	render: (args) => ({
		components: { AuthForgotPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthForgotPassword v-bind="args" />
      </div>
    `,
	}),
	args: { loading: false },
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthForgotPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthForgotPassword v-bind="args" />
      </div>
    `,
	}),
	args: { loading: false },
	play: async ({ canvasElement }) => {
		const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLElement;
		await expect(submit).toBeInTheDocument();
		expectMinTargetSize(submit, 24);
	},
};

export const InteractiveTabOrder: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthForgotPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthForgotPassword v-bind="args" />
      </div>
    `,
	}),
	args: { loading: false },
	play: async ({ canvasElement }) => {
		const email = canvasElement.querySelector('#forgot-email') as HTMLInputElement;
		const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLElement;
		email.focus();
		await expect(email).toHaveFocus();
		await userEvent.tab();
		await expect(submit).toHaveFocus();
	},
};
