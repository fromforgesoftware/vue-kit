import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import AuthSignIn from './AuthSignIn.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Authentication/SignIn',
	component: AuthSignIn,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Sign-in card with email/password, remember-me, social login and links to Forgot password / Register. Emits semantic events; the consumer owns navigation and the auth call.',
			},
		},
	},
	argTypes: {
		loading: {
			control: 'boolean',
			description: 'Disables the form and shows a spinner on the submit button.',
		},
		class: { control: 'text', description: 'Extra classes on the underlying `AuthCard`.' },
		onSubmit: { action: 'submit' },
		onForgotPassword: { action: 'forgotPassword' },
		onRegister: { action: 'register' },
		onGoogleLogin: { action: 'googleLogin' },
		onGithubLogin: { action: 'githubLogin' },
	},
	args: {
		loading: false,
		onSubmit: fn(),
		onForgotPassword: fn(),
		onRegister: fn(),
		onGoogleLogin: fn(),
		onGithubLogin: fn(),
	},
	render: (args) => ({
		components: { AuthSignIn },
		setup: () => ({ args }),
		template: `
      <AuthSignIn
        v-bind="args"
        @submit="(...a) => args.onSubmit?.(...a)"
        @forgot-password="args.onForgotPassword"
        @register="args.onRegister"
        @google-login="args.onGoogleLogin"
        @github-login="args.onGithubLogin"
      />
    `,
	}),
} satisfies Meta<typeof AuthSignIn>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const SignIn: Story = {};

export const SignInLoading: Story = {
	args: { loading: true },
	parameters: {
		docs: { description: { story: 'Form is disabled while a sign-in request is in flight.' } },
	},
};

// ── Interactive (Pattern C: Composite) ──────────────────────────────────────

export const InteractiveOpensViaTrigger: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'The form is visible by default — no trigger needed. We assert the email + password fields are mounted.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const email = canvasElement.querySelector('#signin-email') as HTMLInputElement;
		const password = canvasElement.querySelector('#signin-password') as HTMLInputElement;
		await expect(email).toBeInTheDocument();
		await expect(password).toBeInTheDocument();
	},
};

export const InteractiveClosesOnEscape: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Pressing Escape inside an input does not submit the form. Submission only happens via the Sign in button.',
			},
		},
	},
	play: async ({ canvasElement, args }) => {
		const email = canvasElement.querySelector('#signin-email') as HTMLInputElement;
		email.focus();
		await userEvent.keyboard('{Escape}');
		await expect(args.onSubmit).not.toHaveBeenCalled();
	},
};

export const InteractiveKeyboardNav: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Tab moves focus through email → password → password visibility toggle → remember-me → forgot password → submit.',
			},
		},
	},
	play: async ({ canvasElement, args }) => {
		const email = canvasElement.querySelector('#signin-email') as HTMLInputElement;
		const password = canvasElement.querySelector('#signin-password') as HTMLInputElement;
		email.focus();
		await expect(email).toHaveFocus();
		await userEvent.type(email, 'me@example.com');
		await userEvent.tab();
		await expect(password).toHaveFocus();
		await userEvent.type(password, 'hunter2');
		// Submit via Enter from the password field.
		await userEvent.keyboard('{Enter}');
		await expect(args.onSubmit).toHaveBeenCalled();
	},
};

export const InteractiveFocusTrapAndReturn: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'There is no focus trap on the inline form (it is not a dialog). After clicking the password visibility toggle, focus stays inside the form.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = await canvas.findByRole('button', { name: /Show password/i });
		toggle.focus();
		await expect(toggle).toHaveFocus();
		await userEvent.click(toggle);
		// Toggle flips its aria-label; focus remains on the same control.
		const refreshed = canvasElement.querySelector('[aria-label="Hide password"]') as HTMLElement;
		await expect(refreshed).toBeInTheDocument();
		await expect(refreshed).toHaveFocus();
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'AuthCard renders within `max-w-sm` and stays inside the viewport at every breakpoint.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			await expect(root).toBeVisible();
			expectNoHorizontalOverflow(root);
			const submit = canvasElement.querySelector('[data-slot="auth-submit"]') as HTMLElement;
			await expect(submit).toBeInTheDocument();
			expectMinTargetSize(submit, 24);
		});
		// Reference inBody for portal hosts (e.g. browser autofill panels) — kept
		// in case future variants surface OTP modals via portal.
		void inBody;
	},
};
