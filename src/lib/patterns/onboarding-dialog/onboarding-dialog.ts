import { cva, type VariantProps } from 'class-variance-authority';

export interface OnboardingStep {
	/** Unique identifier for the step */
	id: string;
	/** Step title */
	title: string;
	/** Step description */
	description?: string;
}

export const onboardingDialogContentVariants = cva(
	`bg-background fixed top-1/2 left-1/2 z-[70] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2
   overflow-hidden rounded-xl border shadow-lg sm:max-w-md`,
	{
		variants: {},
		defaultVariants: {},
	},
);

export type OnboardingDialogContentVariants = VariantProps<typeof onboardingDialogContentVariants>;

export const onboardingDialogMediaVariants = cva(
	'relative flex min-h-32 sm:min-h-48 items-center justify-center overflow-hidden bg-muted',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const onboardingDialogBodyVariants = cva('flex flex-col gap-2 px-6 pt-5', {
	variants: {},
	defaultVariants: {},
});

export const onboardingDialogTitleVariants = cva('text-xl font-semibold leading-tight', {
	variants: {},
	defaultVariants: {},
});

export const onboardingDialogDescriptionVariants = cva('text-sm text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export const onboardingDialogFooterVariants = cva(
	'flex items-center justify-between gap-4 px-6 pb-5 pt-4',
	{
		variants: {},
		defaultVariants: {},
	},
);

// Dot indicators paint an 8 px circle (rendered via ::after so it stays exactly
// centred), wrapped in a 24×24 transparent button to satisfy WCAG 2.2 SC 2.5.8
// (Target Size — Minimum). The visible circle remains compact while the click
// target meets the minimum.
export const onboardingDialogDotVariants = cva(
	[
		'relative inline-flex size-6 cursor-pointer items-center justify-center bg-transparent',
		"after:content-[''] after:size-2 after:rounded-full after:transition-colors after:duration-200",
	].join(' '),
	{
		variants: {
			active: {
				true: 'after:bg-foreground',
				false: 'after:bg-muted-foreground/30',
			},
		},
		defaultVariants: {
			active: false,
		},
	},
);

export type OnboardingDialogDotVariants = VariantProps<typeof onboardingDialogDotVariants>;
