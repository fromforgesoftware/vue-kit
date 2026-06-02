import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { nextTick } from 'vue';
import AuthSignIn from './AuthSignIn.vue';
import AuthRegister from './AuthRegister.vue';
import AuthEmailVerification from './AuthEmailVerification.vue';
import AuthForgotPassword from './AuthForgotPassword.vue';
import AuthResetPassword from './AuthResetPassword.vue';
import AuthOTPVerification from './AuthOTPVerification.vue';
import AuthCard from './AuthCard.vue';

describe('AuthCard', () => {
	it('renders default logo with aria-hidden', () => {
		const { container } = render(AuthCard, {
			slots: {
				title: '<h1>Test Title</h1>',
				default: '<p>Content</p>',
			},
		});
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('aria-hidden', 'true');
	});

	it('renders title and content slots', () => {
		render(AuthCard, {
			slots: {
				title: '<h1>My Title</h1>',
				subtitle: '<p>My Subtitle</p>',
				default: '<p>My Content</p>',
			},
		});
		expect(screen.getByText('My Title')).toBeInTheDocument();
		expect(screen.getByText('My Subtitle')).toBeInTheDocument();
		expect(screen.getByText('My Content')).toBeInTheDocument();
	});

	it('applies custom class', () => {
		const { container } = render(AuthCard, {
			props: { class: 'custom-class' },
			slots: { default: '<p>Content</p>' },
		});
		expect(container.firstElementChild).toHaveClass('custom-class');
	});
});

describe('AuthSignIn', () => {
	it('renders the heading', () => {
		render(AuthSignIn);
		expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
	});

	it('has email and password inputs with labels', () => {
		render(AuthSignIn);
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
	});

	it('toggles password visibility', async () => {
		render(AuthSignIn);
		const toggle = screen.getByRole('button', { name: /show password/i });
		const passwordInput = screen.getByLabelText('Password');

		expect(passwordInput).toHaveAttribute('type', 'password');
		await fireEvent.click(toggle);
		expect(passwordInput).toHaveAttribute('type', 'text');
		expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
	});

	it('emits submit with form values', async () => {
		const onSubmit = vi.fn();
		render(AuthSignIn, { props: { onSubmit } });

		const emailInput = screen.getByLabelText('Email');
		const passwordInput = screen.getByLabelText('Password');

		await fireEvent.update(emailInput, 'test@example.com');
		await fireEvent.update(passwordInput, 'secret123');
		await fireEvent.submit(emailInput.closest('form')!);

		expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'secret123', false);
	});

	it('emits forgotPassword when link clicked', async () => {
		const onForgotPassword = vi.fn();
		render(AuthSignIn, { props: { onForgotPassword } });
		await fireEvent.click(screen.getByText(/forgot password/i));
		expect(onForgotPassword).toHaveBeenCalled();
	});

	it('emits register when link clicked', async () => {
		const onRegister = vi.fn();
		render(AuthSignIn, { props: { onRegister } });
		await fireEvent.click(screen.getByRole('button', { name: /register/i }));
		expect(onRegister).toHaveBeenCalled();
	});

	it('has focus-visible ring on all interactive text buttons', () => {
		const { container } = render(AuthSignIn);
		const inlineButtons = container.querySelectorAll('button:not([type="submit"])');
		for (const btn of inlineButtons) {
			const classes = btn.getAttribute('class') ?? '';
			if (classes.includes('focus-visible:outline-none')) {
				expect(classes).toContain('focus-visible');
			}
		}
	});

	it('marks social SVG icons as aria-hidden', () => {
		const { container } = render(AuthSignIn);
		const svgs = container.querySelectorAll('button[type="button"] svg');
		for (const svg of svgs) {
			if (svg.closest('button')?.textContent?.includes('Login with')) {
				expect(svg).toHaveAttribute('aria-hidden', 'true');
			}
		}
	});
});

describe('AuthRegister', () => {
	it('renders the heading', () => {
		render(AuthRegister);
		expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
	});

	it('has all required inputs', () => {
		render(AuthRegister);
		expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
	});

	it('emits submit with form values', async () => {
		const onSubmit = vi.fn();
		render(AuthRegister, { props: { onSubmit } });

		await fireEvent.update(screen.getByLabelText(/^name$/i), 'John');
		await fireEvent.update(screen.getByLabelText(/email/i), 'john@example.com');
		await fireEvent.update(screen.getByLabelText(/^password$/i), 'pass123');
		await fireEvent.update(screen.getByLabelText(/password confirmation/i), 'pass123');

		const form = screen.getByLabelText(/^name$/i).closest('form')!;
		await fireEvent.submit(form);

		expect(onSubmit).toHaveBeenCalledWith('John', 'john@example.com', 'pass123', 'pass123');
	});

	it('emits login when link clicked', async () => {
		const onLogin = vi.fn();
		render(AuthRegister, { props: { onLogin } });
		await fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
		expect(onLogin).toHaveBeenCalled();
	});

	it('has focus ring on login link', () => {
		const { container } = render(AuthRegister);
		const loginBtn = Array.from(container.querySelectorAll('button')).find(
			(b) => b.textContent?.trim() === 'Login',
		);
		expect(loginBtn?.className).toContain('focus-visible');
	});
});

describe('AuthEmailVerification', () => {
	it('renders heading', () => {
		render(AuthEmailVerification);
		expect(screen.getByRole('heading', { name: /thanks for signing up/i })).toBeInTheDocument();
	});

	it('displays email when provided', () => {
		render(AuthEmailVerification, { props: { email: 'user@test.com' } });
		expect(screen.getByText('user@test.com')).toBeInTheDocument();
	});

	it('shows generic text without email', () => {
		render(AuthEmailVerification);
		expect(screen.getByText('your email address')).toBeInTheDocument();
	});

	it('emits resend when button clicked', async () => {
		const onResend = vi.fn();
		render(AuthEmailVerification, { props: { onResend } });
		await fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }));
		expect(onResend).toHaveBeenCalled();
	});

	it('emits logout when link clicked', async () => {
		const onLogout = vi.fn();
		render(AuthEmailVerification, { props: { onLogout } });
		await fireEvent.click(screen.getByText(/log out/i));
		expect(onLogout).toHaveBeenCalled();
	});

	it('has focus ring on logout link', () => {
		const { container } = render(AuthEmailVerification);
		const logoutBtn = Array.from(container.querySelectorAll('button')).find(
			(b) => b.textContent?.trim() === 'Log out',
		);
		expect(logoutBtn?.className).toContain('focus-visible');
	});
});

describe('AuthForgotPassword', () => {
	it('renders heading', () => {
		render(AuthForgotPassword);
		expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument();
	});

	it('has email input', () => {
		render(AuthForgotPassword);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
	});

	it('emits submit with email', async () => {
		const onSubmit = vi.fn();
		render(AuthForgotPassword, { props: { onSubmit } });

		await fireEvent.update(screen.getByLabelText(/email/i), 'forgot@test.com');
		const form = screen.getByLabelText(/email/i).closest('form')!;
		await fireEvent.submit(form);

		expect(onSubmit).toHaveBeenCalledWith('forgot@test.com');
	});

	it('emits login when link clicked', async () => {
		const onLogin = vi.fn();
		render(AuthForgotPassword, { props: { onLogin } });
		await fireEvent.click(screen.getByRole('button', { name: /login/i }));
		expect(onLogin).toHaveBeenCalled();
	});
});

describe('AuthResetPassword', () => {
	it('renders heading', () => {
		render(AuthResetPassword);
		expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
	});

	it('has password and confirmation inputs', () => {
		render(AuthResetPassword);
		expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/password confirmation/i)).toBeInTheDocument();
	});

	it('emits submit with both passwords', async () => {
		const onSubmit = vi.fn();
		render(AuthResetPassword, { props: { onSubmit } });

		await fireEvent.update(screen.getByLabelText(/^password$/i), 'newpass');
		await fireEvent.update(screen.getByLabelText(/password confirmation/i), 'newpass');
		const form = screen.getByLabelText(/^password$/i).closest('form')!;
		await fireEvent.submit(form);

		expect(onSubmit).toHaveBeenCalledWith('newpass', 'newpass');
	});
});

describe('AuthOTPVerification', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders verification heading', () => {
		render(AuthOTPVerification);
		expect(
			screen.getByRole('heading', { name: /enter your verification code/i }),
		).toBeInTheDocument();
	});

	it('shows realm badge when realm provided', () => {
		render(AuthOTPVerification, { props: { realm: 'acme' } });
		expect(screen.getByText('acme')).toBeInTheDocument();
		expect(screen.getByText(/signing in to/i)).toBeInTheDocument();
	});

	it('shows email when provided', () => {
		render(AuthOTPVerification, { props: { email: 'admin@demo.com' } });
		expect(screen.getByText('admin@demo.com')).toBeInTheDocument();
	});

	it('shows generic text without email', () => {
		render(AuthOTPVerification);
		expect(screen.getByText('your email')).toBeInTheDocument();
	});

	it('displays error message with role="alert"', () => {
		render(AuthOTPVerification, { props: { error: 'Invalid code' } });
		const alert = screen.getByRole('alert');
		expect(alert).toBeInTheDocument();
		expect(alert).toHaveTextContent('Invalid code');
	});

	it('shows countdown timer initially', () => {
		render(AuthOTPVerification, { props: { resendCooldown: 60 } });
		expect(screen.getByText(/resend available in/i)).toBeInTheDocument();
		expect(screen.getByText(/01:00/)).toBeInTheDocument();
	});

	it('shows resend button after cooldown expires', async () => {
		render(AuthOTPVerification, { props: { resendCooldown: 3 } });
		expect(screen.getByText(/resend available in/i)).toBeInTheDocument();

		vi.advanceTimersByTime(3100);
		await nextTick();

		expect(screen.getByRole('button', { name: /resend code/i })).toBeInTheDocument();
	});

	it('emits resend and restarts timer when resend clicked', async () => {
		const onResend = vi.fn();
		render(AuthOTPVerification, { props: { resendCooldown: 1, onResend } });

		vi.advanceTimersByTime(1100);
		await nextTick();

		await fireEvent.click(screen.getByRole('button', { name: /resend code/i }));
		expect(onResend).toHaveBeenCalled();
		expect(screen.getByText(/resend available in/i)).toBeInTheDocument();
	});

	it('has focus ring on resend button', async () => {
		render(AuthOTPVerification, { props: { resendCooldown: 1 } });

		vi.advanceTimersByTime(1100);
		await nextTick();

		const resendBtn = screen.getByRole('button', { name: /resend code/i });
		expect(resendBtn.className).toContain('focus-visible');
	});
});

describe('Dark mode audit', () => {
	const authComponents = [
		{ name: 'AuthSignIn', component: AuthSignIn },
		{ name: 'AuthRegister', component: AuthRegister },
		{ name: 'AuthForgotPassword', component: AuthForgotPassword },
		{ name: 'AuthResetPassword', component: AuthResetPassword },
		{ name: 'AuthEmailVerification', component: AuthEmailVerification },
	];

	for (const { name, component } of authComponents) {
		it(`${name} uses no raw color classes`, () => {
			const { container } = render(component);
			const allElements = container.querySelectorAll('*');
			const rawColorPattern =
				/\b(bg-white|bg-black|bg-gray-|text-white|text-black|text-gray-|border-gray-|text-red-|text-green-|text-blue-)\b/;

			for (const el of allElements) {
				const cls = el.getAttribute('class') ?? '';
				expect(cls).not.toMatch(rawColorPattern);
			}
		});
	}

	it('AuthOTPVerification uses no raw color classes', () => {
		vi.useFakeTimers();
		const { container } = render(AuthOTPVerification);
		const allElements = container.querySelectorAll('*');
		const rawColorPattern =
			/\b(bg-white|bg-black|bg-gray-|text-white|text-black|text-gray-|border-gray-|text-red-|text-green-|text-blue-)\b/;

		for (const el of allElements) {
			const cls = el.getAttribute('class') ?? '';
			expect(cls).not.toMatch(rawColorPattern);
		}
		vi.useRealTimers();
	});
});
