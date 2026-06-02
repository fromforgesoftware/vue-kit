import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent } from 'storybook/test';
import AuthEmailVerification from './AuthEmailVerification.vue';
import { expectMinTargetSize } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Authentication/EmailVerification',
	component: AuthEmailVerification,
	tags: ['!autodocs'],
	parameters: { layout: 'fullscreen' },
	argTypes: {
		email: { control: 'text' },
		loading: { control: 'boolean' },
	},
} satisfies Meta<typeof AuthEmailVerification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailVerification: Story = {
	render: (args) => ({
		components: { AuthEmailVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthEmailVerification v-bind="args" />
      </div>
    `,
	}),
	args: {
		email: 'example@email.com',
		loading: false,
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthEmailVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthEmailVerification v-bind="args" />
      </div>
    `,
	}),
	args: { email: 'example@email.com', loading: false },
	play: async ({ canvasElement }) => {
		const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLElement;
		await expect(submit).toBeInTheDocument();
		expectMinTargetSize(submit, 24);
	},
};

export const InteractiveTabOrder: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { AuthEmailVerification },
		setup() {
			return { args };
		},
		template: `
      <div class="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
        <AuthEmailVerification v-bind="args" />
      </div>
    `,
	}),
	args: { email: 'example@email.com', loading: false },
	play: async ({ canvasElement }) => {
		const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLButtonElement;
		submit.focus();
		await expect(submit).toHaveFocus();
		await userEvent.tab();
		// Tab should move focus to the Log out button (next focusable)
		const logout = canvasElement.querySelector('button[type="button"]') as HTMLButtonElement;
		await expect(logout).toHaveFocus();
	},
};
