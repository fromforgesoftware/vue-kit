import { cva } from 'class-variance-authority';

/**
 * Base card shell used by all authentication screens.
 * White card, centered, with subtle border and shadow.
 */
export const authCardVariants = cva(
	'w-full max-w-sm rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm',
);

export interface AuthSignInProps {
	loading?: boolean;
	/** Error message rendered as a destructive alert above the form. */
	error?: string | null;
	class?: string;
	/** Toggle the "Login with Google" button. Default true. */
	showGoogleLogin?: boolean;
	/** Toggle the "Login with GitHub" button. Default true. */
	showGithubLogin?: boolean;
}

export interface AuthRegisterProps {
	loading?: boolean;
	class?: string;
}

export interface AuthEmailVerificationProps {
	email?: string;
	loading?: boolean;
	class?: string;
}

export interface AuthForgotPasswordProps {
	loading?: boolean;
	class?: string;
}

export interface AuthResetPasswordProps {
	loading?: boolean;
	class?: string;
}

export interface AuthOTPVerificationProps {
	email?: string;
	realm?: string;
	/** Countdown in seconds before the resend link becomes active. Default: 60 */
	resendCooldown?: number;
	loading?: boolean;
	error?: string;
	class?: string;
}
