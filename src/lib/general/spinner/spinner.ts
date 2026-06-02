import { cva, type VariantProps } from 'class-variance-authority';

export const spinnerVariants = cva('animate-spin', {
	variants: {
		size: {
			xs: 'h-3 w-3',
			sm: 'h-4 w-4',
			default: 'h-5 w-5',
			lg: 'h-8 w-8',
			xl: 'h-12 w-12',
		},
		tone: {
			default: 'text-muted-foreground',
			primary: 'text-primary',
			current: 'text-current',
		},
	},
	defaultVariants: {
		size: 'default',
		tone: 'default',
	},
});

export type SpinnerVariants = VariantProps<typeof spinnerVariants>;
export type SpinnerSize = NonNullable<SpinnerVariants['size']>;
export type SpinnerTone = NonNullable<SpinnerVariants['tone']>;
