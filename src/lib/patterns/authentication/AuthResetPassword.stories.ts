import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import AuthResetPassword from './AuthResetPassword.vue';
import { expectMinTargetSize } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Authentication/ResetPassword',
	component: AuthResetPassword,
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen' },
	argTypes: {
		loading: { control: 'boolean' },
	},
} satisfies Meta<typeof AuthResetPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResetPassword: Story = {
	render: (args) => ({
		components: { AuthResetPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthResetPassword v-bind="args" />
      </div>
    `,
	}),
	args: { loading: false },
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthResetPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthResetPassword v-bind="args" />
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
		components: { AuthResetPassword },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthResetPassword v-bind="args" />
      </div>
    `,
	}),
	args: { loading: false },
	play: async ({ canvasElement }) => {
		const password = canvasElement.querySelector('#reset-password') as HTMLInputElement;
		const confirm = canvasElement.querySelector('#reset-password-confirm') as HTMLInputElement;
		password.focus();
		await expect(password).toHaveFocus();
		await userEvent.tab();
		await expect(confirm).toHaveFocus();
	},
};
