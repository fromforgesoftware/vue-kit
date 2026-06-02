import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Layout wrapper for {@link NumberField}. The visual shell (border, focus ring)
 * lives on the input + buttons so each segment carries its own `focus-visible`.
 */
export const numberFieldRootVariants = cva('inline-flex items-center', {
	variants: {
		size: {
			sm: '',
			default: '',
			lg: '',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

// The native input. Border lives on the input itself (between the +/- buttons)
// and focused input rises above siblings via z-index so the full ring is
// visible. iOS Safari will auto-zoom on focus (font-size < 16 px) — we
// accept the quirk over breaking visual proportions.
export const numberFieldInputVariants = cva(
	[
		'border-input placeholder:text-muted-foreground',
		'relative w-full min-w-[3.5rem] -mx-px border bg-transparent text-center',
		'text-sm transition-[color,box-shadow] outline-none',
		'focus:z-10 focus:ring-0 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
		'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 px-2 py-1',
				default: 'h-8 px-3 py-1',
				lg: 'h-10 px-3 py-2',
			},
			variant: {
				default: '',
				error: 'border-destructive ring-destructive/20',
			},
		},
		defaultVariants: {
			size: 'default',
			variant: 'default',
		},
	},
);

// Increment / decrement buttons. Sized to meet WCAG 2.2 SC 2.5.8 (≥ 24×24)
// at every size — even `sm` is 28×28.
export const numberFieldButtonVariants = cva(
	[
		'relative inline-flex shrink-0 items-center justify-center border border-input bg-transparent',
		'text-muted-foreground transition-colors',
		'hover:bg-accent hover:text-accent-foreground',
		'focus:z-10 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
		'disabled:pointer-events-none disabled:opacity-50',
		"[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	].join(' '),
	{
		variants: {
			side: {
				decrement: 'rounded-l-md',
				increment: 'rounded-r-md',
			},
			size: {
				sm: 'h-7 w-7',
				default: 'h-8 w-8',
				lg: 'h-10 w-10',
			},
		},
		defaultVariants: {
			side: 'decrement',
			size: 'default',
		},
	},
);

export type NumberFieldRootVariants = VariantProps<typeof numberFieldRootVariants>;
export type NumberFieldInputVariants = VariantProps<typeof numberFieldInputVariants>;
export type NumberFieldButtonVariants = VariantProps<typeof numberFieldButtonVariants>;
export type NumberFieldSize = NonNullable<NumberFieldInputVariants['size']>;
export type NumberFieldVariant = NonNullable<NumberFieldInputVariants['variant']>;
