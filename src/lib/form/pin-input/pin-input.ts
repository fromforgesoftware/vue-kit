import { cva, type VariantProps } from 'class-variance-authority';

// Wrapper around the cells. Layout only — focus rings live on each cell.
export const pinInputRootVariants = cva('inline-flex items-center', {
	variants: {
		size: {
			sm: 'gap-1.5',
			default: 'gap-2',
			lg: 'gap-2.5',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

// Each cell is a single-character input. Square aspect at every size; the
// smallest (`sm`, 28 px) clears WCAG 2.2 SC 2.5.8 ≥ 24×24. Heights stay
// identical across viewports so OTP layouts don't reflow on rotation.
export const pinInputInputVariants = cva(
	[
		'border-input placeholder:text-muted-foreground',
		'flex items-center justify-center rounded-md border bg-transparent',
		'text-center transition-[color,box-shadow] outline-none shadow-xs',
		'focus:z-10 focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
		'data-[complete]:border-primary',
		'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'h-7 w-7 text-sm',
				default: 'h-8 w-8 text-sm',
				lg: 'h-10 w-10 text-base',
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

export type PinInputRootVariants = VariantProps<typeof pinInputRootVariants>;
export type PinInputInputVariants = VariantProps<typeof pinInputInputVariants>;
export type PinInputSize = NonNullable<PinInputRootVariants['size']>;
export type PinInputVariant = NonNullable<PinInputInputVariants['variant']>;
